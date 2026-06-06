#!/usr/bin/env python3
import os
import sys
import json
import sqlite3
import hashlib
import mimetypes
import urllib.parse
import time
import traceback
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lorentz.db")

# Ensure MIME types include JSX
mimetypes.add_type("application/javascript", ".jsx")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/html", ".html")
mimetypes.add_type("text/css", ".css")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        module TEXT NOT NULL,
        depth REAL NOT NULL,
        nodes INTEGER NOT NULL,
        score INTEGER NOT NULL,
        status TEXT NOT NULL, -- 'active', 'review', 'idle'
        lastHash TEXT NOT NULL,
        topic TEXT NOT NULL,
        grade TEXT NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT 1,
        lastBlock INTEGER NOT NULL DEFAULT 1247835
    )""")

    # Chat Messages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        role TEXT NOT NULL, -- 'ai', 'student'
        timestamp TEXT NOT NULL,
        nodeId TEXT,
        text TEXT NOT NULL,
        formula TEXT,
        formulaNote TEXT,
        concepts TEXT -- JSON string
    )""")

    # Graph Nodes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT,
        student_id TEXT NOT NULL,
        label TEXT NOT NULL,
        type TEXT NOT NULL,
        hash TEXT NOT NULL,
        module TEXT NOT NULL,
        isRoot BOOLEAN DEFAULT 0,
        PRIMARY KEY (id, student_id)
    )""")

    # Graph Edges Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS graph_edges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        source TEXT NOT NULL,
        target TEXT NOT NULL,
        label TEXT
    )""")

    # KMerge Commits
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kmerge_commits (
        hash TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        msg TEXT NOT NULL,
        ts TEXT NOT NULL,
        branch TEXT NOT NULL,
        lines TEXT NOT NULL
    )""")

    # KMerge Lines
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kmerge_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        author TEXT,
        type TEXT NOT NULL,
        indent INTEGER DEFAULT 0
    )""")

    # Discursus Transcript
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS discursus_transcript (
        id TEXT PRIMARY KEY,
        speaker TEXT NOT NULL,
        time TEXT NOT NULL,
        text TEXT NOT NULL,
        extracted BOOLEAN NOT NULL
    )""")

    # Axiom Events Ledger
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS axiom_events (
        id TEXT PRIMARY KEY,
        block INTEGER NOT NULL,
        ts TEXT NOT NULL,
        type TEXT NOT NULL,
        module TEXT NOT NULL,
        student TEXT NOT NULL,
        hash TEXT NOT NULL,
        payload TEXT NOT NULL
    )""")

    # Populate default data if students table is empty
    cursor.execute("SELECT COUNT(*) FROM students")
    if cursor.fetchone()[0] == 0:
        print("Initializing database with default Lorentz.ai data...")
        
        # Insert students
        students = [
            ("JD", "Johannes Droste", "synaptrac", 8.4, 24, 91, "active", "0x4f2a", "Transformaciones de Lorentz", "A", 1, 1247835),
            ("MR", "María Ruiz", "discursus", 6.1, 17, 74, "active", "0x9c3d", "Relatividad del tiempo", "B+", 1, 1247830),
            ("KA", "Kai Andersen", "kmerge", 7.8, 31, 88, "review", "0x7a1b", "Espacio-tiempo de Minkowski", "A-", 1, 1247828),
            ("PV", "Pedro Vega", "synaptrac", 4.2, 9, 52, "idle", "0x2e7c", "Postulados de Einstein", "C+", 0, 1247810),
            ("RT", "Rosa Tejada", "discursus", 9.1, 38, 97, "active", "0x5b9a", "Curvatura del espacio-tiempo", "A+", 1, 1247832),
            ("TS", "Tomás Santos", "kmerge", 3.5, 7, 41, "idle", "0x1d4e", "Efecto Doppler relativista", "D", 0, 1247799),
        ]
        cursor.executemany("""
        INSERT INTO students (id, name, module, depth, nodes, score, status, lastHash, topic, grade, verified, lastBlock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", students)

        # Insert default chat history for JD (Johannes Droste)
        jd_chat = [
            ("m1", "JD", "ai", "14:18:04", "root", "Bienvenido de vuelta, Johannes Droste. El tema asignado para esta sesión es Transformaciones de Lorentz en marcos de referencia inerciales. ¿Por dónde quieres comenzar el análisis?", None, None, "[]"),
            ("m2", "JD", "student", "14:19:22", None, "Quiero entender la dilatación temporal. ¿Por qué un observador en movimiento experimenta el tiempo más lento desde otro frame?", None, None, "[]"),
            ("m3", "JD", "ai", "14:20:11", "n1", "La dilatación temporal surge directamente del postulado de invariancia de c. Si Δx = 0 para un observador en reposo, el intervalo temporal medido por el observador en movimiento escala según:", "Δt′ = γ · Δt,  donde  γ = 1 / √(1 − v²/c²)", "Para v → c, γ → ∞. El reloj en movimiento avanza más lento desde el frame externo.", '[{"id":"c1","label":"Factor γ de Lorentz","type":"equation"},{"id":"c2","label":"Invariancia de c","type":"concept"}]'),
            ("m4", "JD", "student", "14:22:35", None, "Pero si todo movimiento es relativo, ¿quién envejece más lento? Ambos observadores podrían afirmar que el otro envejece lento.", None, None, "[]"),
            ("m5", "JD", "ai", "14:23:10", "n2", "Correcta identificación. La asimetría surge porque los dos observadores no son equivalentes: uno permanece en un frame inercial, el otro experimenta aceleración al invertir su trayectoria. La aceleración rompe la simetría de la relatividad especial. El gemelo que regresa ha recorrido una trayectoria con menor longitud geodésica y ha envejecido menos.", None, None, '[{"id":"c3","label":"Paradoja de los Gemelos","type":"concept"},{"id":"c4","label":"Geodésica espacio-tiempo","type":"concept"}]'),
            ("m6", "JD", "student", "14:25:00", None, "Entonces el invariante de intervalo ds² = c²dt² − dx² es la clave para comparar los relojes.", None, None, "[]"),
            ("m7", "JD", "ai", "14:26:00", "n3", "Exacto. El intervalo propio dτ = ds/c es lo que cada reloj mide a lo largo de su propia trayectoria. El gemelo viajero acumula menos τ porque recorre una trayectoria de menor longitud geodésica — aunque mayor longitud espacial. Este es el corazón de la geometría de Minkowski.", None, None, "[]")
        ]
        cursor.executemany("""
        INSERT INTO chat_messages (id, student_id, role, timestamp, nodeId, text, formula, formulaNote, concepts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", jd_chat)

        # MR chat
        mr_chat = [
            ("m_mr1", "MR", "ai", "10:05:00", "root", "Bienvenida, María. Hoy exploramos relatividad del tiempo. ¿Desde dónde quieres iniciar?", None, None, "[]"),
            ("m_mr2", "MR", "student", "10:06:00", None, "Quiero entender por qué c es constante aunque la fuente se mueva.", None, None, "[]"),
            ("m_mr3", "MR", "ai", "10:07:00", "n1", "El experimento Michelson-Morley (1887) demostró que c no depende del movimiento de la fuente ni del observador. Esto motivó a Einstein a adoptarlo como postulado, descartando el éter luminífero.", None, None, "[]"),
            ("m_mr4", "MR", "student", "10:09:00", None, "¿Cómo se reconcilia eso con la adición de velocidades de Galileo?", None, None, "[]"),
            ("m_mr5", "MR", "ai", "10:10:00", "n2", "La adición galileana v₁+v₂ falla a velocidades relativistas. La versión correcta es: u = (v₁+v₂)/(1+v₁v₂/c²). Para v₁=v₂=c/2: u = c no c. La estructura del grupo de Lorentz reemplaza al grupo de Galileo.", "u = (v₁+v₂) / (1 + v₁v₂/c²)", None, "[]")
        ]
        cursor.executemany("""
        INSERT INTO chat_messages (id, student_id, role, timestamp, nodeId, text, formula, formulaNote, concepts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", mr_chat)

        # KA chat
        ka_chat = [
            ("m_ka1", "KA", "ai", "09:30:00", "root", "Kai, el tema de hoy es la geometría de Minkowski. ¿Has revisado el diagrama espacio-temporal?", None, None, "[]"),
            ("m_ka2", "KA", "student", "09:31:00", None, "Sí, pero no entiendo por qué los conos de luz son los límites causales.", None, None, "[]"),
            ("m_ka3", "KA", "ai", "09:33:00", "n1", "Los conos de luz definen qué eventos pueden tener influencia causal sobre otros. Ninguna señal puede superar c, por lo que el cono futuro de un evento contiene exactamente los eventos que ese evento puede influenciar. Fuera del cono: separación espacial — sin posible causalidad.", None, None, "[]"),
            ("m_ka4", "KA", "student", "09:35:00", None, "Entonces dos eventos simultáneos en un frame pueden no serlo en otro.", None, None, "[]"),
            ("m_ka5", "KA", "ai", "09:36:00", "n2", "Correcto: la simultaneidad es relativa. Si dos eventos tienen separación espacial (ds²>0), existe un frame donde son simultáneos y otro donde no. Solo los eventos con ds²<0 (separación temporal) mantienen su orden causal en todos los frames.", None, None, "[]")
        ]
        cursor.executemany("""
        INSERT INTO chat_messages (id, student_id, role, timestamp, nodeId, text, formula, formulaNote, concepts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", ka_chat)

        # Insert default graph nodes
        nodes = [
            # JD
            ("root", "JD", "LORENTZ", "branch", "0x6e54", "synaptrac", 1),
            ("n1", "JD", "Dil. temp.", "branch", "0x7a3f", "synaptrac", 0),
            ("n2", "JD", "Paradoja", "branch", "0x9c4d", "synaptrac", 0),
            ("n3", "JD", "Geodésica", "leaf", "0x2e7c", "synaptrac", 0),
            ("n4", "JD", "Factor γ", "branch", "0x4f2a", "synaptrac", 0),
            ("n5", "JD", "Maxwell", "leaf", "0x8b3d", "discursus", 0),
            ("n6", "JD", "Inv. c", "leaf", "0x6a2b", "synaptrac", 0),
            ("n7", "JD", "Éter", "leaf", "0x3c9e", "discursus", 0),
            ("n8", "JD", "Commit-1", "leaf", "0x1d4e", "kmerge", 0),
            ("n9", "JD", "Minkowski", "branch", "0x5b9a", "synaptrac", 0),
            ("n10", "JD", "Curvatura", "leaf", "0x7f2c", "synaptrac", 0),
            # MR
            ("root", "MR", "MICHELSON", "branch", "0x9c3d", "synaptrac", 1),
            ("n1", "MR", "Inv. c", "branch", "0x4a1b", "synaptrac", 0),
            ("n2", "MR", "Galileo", "leaf", "0x8d3f", "synaptrac", 0),
            # KA
            ("root", "KA", "MINKOWSKI", "branch", "0x7a1b", "synaptrac", 1),
            ("n1", "KA", "Conos luz", "branch", "0x3c9e", "synaptrac", 0),
            ("n2", "KA", "Simultán.", "leaf", "0x6b2a", "synaptrac", 0)
        ]
        cursor.executemany("""
        INSERT INTO graph_nodes (id, student_id, label, type, hash, module, isRoot)
        VALUES (?, ?, ?, ?, ?, ?, ?)""", nodes)

        # Insert default graph edges
        edges = [
            # JD
            ("JD", "root", "n1", "explora"),
            ("JD", "n1", "n2", "deriva"),
            ("JD", "n2", "n3", "resuelve"),
            ("JD", "root", "n4", "deriva"),
            ("JD", "root", "n9", "vincula"),
            ("JD", "n1", "n6", "explora"),
            ("JD", "n4", "n5", "vincula"),
            ("JD", "n4", "n7", "vincula"),
            ("JD", "n4", "n8", "vincula"),
            ("JD", "n9", "n10", "deriva"),
            # MR
            ("MR", "root", "n1", "explora"),
            ("MR", "n1", "n2", "compara"),
            # KA
            ("KA", "root", "n1", "explora"),
            ("KA", "n1", "n2", "compara")
        ]
        cursor.executemany("""
        INSERT INTO graph_edges (student_id, source, target, label)
        VALUES (?, ?, ?, ?)""", edges)

        # Insert default commits
        commits = [
            ("4f2a", "JD", "Añadir tensor electromagnético F^μν", "hace 12 min", "main", "+14 -2"),
            ("9c3d", "KA", "Completar campos transformados S'", "hace 35 min", "main", "+8 -0"),
            ("7a1b", "MR", "Formulación covariante 4-fuerza", "hace 1h", "main", "+12 -1"),
            ("5b9a", "PV", "Fix: componente E_z en la matriz", "hace 2h", "fix/tensor", "+2 -2"),
            ("3e8f", "JD", "Estructura inicial y abstract", "hace 3h", "main", "+48 -0"),
            ("1d4e", "MR", "Init: \\documentclass y paquetes", "hace 4h", "main", "+6 -0"),
        ]
        cursor.executemany("""
        INSERT INTO kmerge_commits (hash, author, msg, ts, branch, lines)
        VALUES (?, ?, ?, ?, ?, ?)""", commits)

        # Insert default LaTeX lines
        latex_lines = [
            (r"\documentclass[12pt]{article}", "JD", "meta", 0),
            (r"\usepackage{amsmath, amssymb, physics}", "JD", "meta", 0),
            (r"\title{La Fuerza de Lorentz y Transformaciones de Coordenadas}", "JD", "meta", 0),
            (r"\author{Grupo 07 · Física Avanzada · Sem. 2025-I}", "MR", "meta", 0),
            (r"\date{\today}", "JD", "meta", 0),
            ("", None, "blank", 0),
            (r"\begin{document}", "JD", "meta", 0),
            (r"\maketitle", "JD", "meta", 0),
            ("", None, "blank", 0),
            (r"\begin{abstract}", "MR", "env", 0),
            ("La fuerza de Lorentz describe la interacción de cargas eléctricas en", "MR", "body", 1),
            ("presencia de campos electromagnéticos. Este trabajo deriva las expresiones", "MR", "body", 1),
            ("covariantes bajo transformaciones de Lorentz, demostrando la consistencia", "KA", "body", 1),
            ("del electromagnetismo con la relatividad especial de Einstein (1905).", "KA", "body", 1),
            (r"\end{abstract}", "MR", "env", 0),
            ("", None, "blank", 0),
            (r"\section{Introducción}", "JD", "section", 0),
            ("", None, "blank", 0),
            ("El fenómeno de la fuerza sobre una partícula cargada fue formulado por", "JD", "body", 0),
            ("H.A. Lorentz en 1895. Para una carga $q$ con velocidad $\\mathbf{v}$:", "JD", "body", 0),
            ("", None, "blank", 0),
            (r"\begin{equation}", "JD", "env", 0),
            (r"  \mathbf{F} = q\left(\mathbf{E} + \mathbf{v} \times \mathbf{B}\right)", "JD", "equation", 1),
            (r"\end{equation}", "JD", "env", 0),
            ("", None, "blank", 0),
            ("donde $\\mathbf{E}$ es el campo eléctrico y $\\mathbf{B}$ el campo magnético.", "PV", "body", 0),
            ("La fuerza eléctrica $q\\mathbf{E}$ actúa independiente del movimiento,", "PV", "body", 0),
            ("mientras que la fuerza magnética $q(\\mathbf{v}\\times\\mathbf{B})$ depende", "KA", "body", 0),
            ("de la velocidad relativa al campo.", "KA", "body", 0),
            ("", None, "blank", 0),
            (r"\section{Formulación Covariante}", "JD", "section", 0),
            ("", None, "blank", 0),
            ("En formulación covariante, la 4-fuerza de Lorentz es:", "MR", "body", 0),
            ("", None, "blank", 0),
            (r"\begin{equation}", "MR", "env", 0),
            (r"  f^\mu = q F^{\mu\nu} u_nu", "MR", "equation", 1),
            (r"\end{equation}", "MR", "env", 0),
            ("", None, "blank", 0),
            ("donde $F^{\\mu\\nu}$ es el tensor electromagnético de Faraday,", "KA", "body", 0),
            ("$u_\\nu$ la 4-velocidad y los índices griegos recorren $\\{0,1,2,3\\}$.", "KA", "body", 0),
            ("", None, "blank", 0),
            (r"\subsection{El Tensor Electromagnético}", "JD", "subsection", 0),
            ("", None, "blank", 0),
            ("El tensor $F^{\\mu\\nu}$ en unidades gaussianas adopta la forma:", "JD", "body", 0),
            ("", None, "blank", 0),
            (r"\begin{equation}", "JD", "env", 0),
            (r"  F^{\mu\nu} = \begin{pmatrix} 0 & -E_x & -E_y & -E_z \\", "JD", "equation", 1),
            (r"    E_x & 0 & -B_z & B_y \\ E_y & B_z & 0 & -B_x \\", "JD", "equation", 1),
            (r"    E_z & -B_y & B_x & 0 \end{pmatrix}", "PV", "equation", 1),
            (r"\end{equation}", "JD", "env", 0),
            ("", None, "blank", 0),
            (r"\section{Transformación bajo Boost de Lorentz}", "MR", "section", 0),
            ("", None, "blank", 0),
            ("Para un boost en la dirección $x$ con velocidad $v$, el factor de Lorentz:", "MR", "body", 0),
            ("", None, "blank", 0),
            (r"\begin{equation}", "MR", "env", 0),
            (r"  \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}", "MR", "equation", 1),
            (r"\end{equation}", "MR", "env", 0),
            ("", None, "blank", 0),
            ("Los campos transformados en el nuevo frame $S^\\prime$ resultan:", "KA", "body", 0),
            ("", None, "blank", 0),
            ("  $E^\\prime_x = E_x$ \\quad $E^\\prime_y = \\gamma(E_y - vB_z)$", "KA", "body", 1),
            ("  $E^\\prime_z = \\gamma(E_z + vB_y)$ \\quad $B^\\prime_x = B_x$", "KA", "body", 1),
            ("", None, "blank", 0),
            (r"\end{document}", "JD", "meta", 0),
        ]
        cursor.executemany("""
        INSERT INTO kmerge_lines (text, author, type, indent)
        VALUES (?, ?, ?, ?)""", latex_lines)

        # Insert default transcript
        transcript = [
            ("t1", "Node L-442", "00:02:14", "El experimento de Michelson-Morley es fundamental para entender por qué asumimos la constancia de c en todos los frames de referencia.", 1),
            ("t2", "Node M-117", "00:03:01", "Exacto. Pero el diseño del interferómetro también tenía limitaciones instrumentales que muchos análisis modernos ignoran.", 0),
            ("t3", "Node K-089", "00:04:22", "Si consideramos la deriva del éter como hipótesis alternativa, la nulidad del resultado se vuelve más interesante estadísticamente.", 1),
            ("t4", "Node L-442", "00:05:45", "La interpretación de Lorentz — contracción de longitud — también explica el resultado, sin necesidad de abandonar el éter. Einstein eligió la parsimonia.", 0),
            ("t5", "Node P-203", "00:06:30", "Pero la parsimonia no implica verdad. ¿Cómo diferenciamos entre teorías empíricamente equivalentes?", 0),
            ("t6", "Node M-117", "00:08:11", "La navaja de Occam no es un criterio epistémico, es heurístico. El poder predictivo de la relatividad especial lo resuelve a favor de Einstein.", 0),
        ]
        cursor.executemany("""
        INSERT INTO discursus_transcript (id, speaker, time, text, extracted)
        VALUES (?, ?, ?, ?, ?)""", transcript)

        # Insert default events for ledger (Axiom L2)
        events = [
            ("e1", 1247835, "14:24:01", "NODE_CREATED", "synaptrac", "JD", "0x4f2a9b3cd1e7", '{"student":"JD","note":"Derivó correctamente el factor γ desde los postulados","depth":4.2,"hash_prev":"0x9c3d7a2b"}'),
            ("e2", 1247830, "13:55:12", "COMMIT_MERGED", "kmerge", "JD", "0x7a1b4e2ff2a8", '{"student":"JD","file":"Lorentz_Force.tex","lines":"+12/-2","msg":"Añadir tensor F^μν"}'),
            ("e3", 1247828, "12:30:45", "VOICE_NODE", "discursus", "JD", "0x9c3d8a1bb5c4", '{"student":"JD","session":"d-07","fragment":"Michelson-Morley","duration_s":34}'),
            ("e4", 1247825, "11:15:22", "NODE_CREATED", "synaptrac", "JD", "0x6e54a1c2e9f1", '{"student":"JD","note":"Análisis profundo de simultaneidad","depth":3.1}'),
            ("e5", 1247830, "10:42:11", "NODE_CREATED", "synaptrac", "MR", "0x9c3d7a2be5f3", '{"student":"MR","note":"Investigación activa en invariancia de c","depth":2.8}'),
            ("e6", 1247822, "09:58:34", "COMMIT_MERGED", "kmerge", "MR", "0x4a1b8f3cd2e8", '{"student":"MR","file":"Lorentz_Force.tex","lines":"+6/-0","msg":"Formulación covariante"}'),
            ("e7", 1247828, "09:33:05", "COMMIT_MERGED", "kmerge", "KA", "0x7a1b4e9da3b7", '{"student":"KA","file":"Lorentz_Force.tex","lines":"+8/-0","msg":"Completar campos transformados"}'),
            ("e8", 1247815, "08:45:00", "NODE_CREATED", "synaptrac", "KA", "0x3c9e2d1af6c4", '{"student":"KA","note":"Estudio de conos de luz y causalidad","depth":5.0}')
        ]
        cursor.executemany("""
        INSERT INTO axiom_events (id, block, ts, type, module, student, hash, payload)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""", events)

        conn.commit()
    conn.close()

# ── API Logic ──

def handle_api(path, method, body_data):
    parsed = urllib.parse.urlparse(path)
    route = parsed.path
    query = urllib.parse.parse_qs(parsed.query)

    conn = get_db()
    cursor = conn.cursor()

    response_data = None
    status_code = 200

    try:
        if route == "/api/status" and method == "GET":
            response_data = {"status": "ok", "db": DB_PATH}

        elif route == "/api/chat/messages" and method == "GET":
            student_id = query.get("student_id", ["JD"])[0]
            cursor.execute("""
                SELECT id, role, timestamp, nodeId, text, formula, formulaNote, concepts 
                FROM chat_messages 
                WHERE student_id = ? 
                ORDER BY timestamp ASC
            """, (student_id,))
            messages = []
            for row in cursor.fetchall():
                msg = dict(row)
                msg["concepts"] = json.loads(msg["concepts"] or "[]")
                messages.append(msg)
            response_data = messages

        elif route == "/api/chat/send" and method == "POST":
            payload = json.loads(body_data) if body_data else {}
            student_id = payload.get("student_id", "JD")
            text = payload.get("text", "")
            
            if not text.strip():
                status_code = 400
                response_data = {"error": "Text is empty"}
            else:
                timestamp = payload.get("timestamp") or "12:00:00"
                # Use current timestamp for msg_id to keep it unique
                msg_id = f"m_{int(time.time() * 1000)}"
                cursor.execute("""
                    INSERT INTO chat_messages (id, student_id, role, timestamp, text, concepts)
                    VALUES (?, ?, 'student', ?, ?, '[]')
                """, (msg_id, student_id, timestamp, text))

                # Update student
                cursor.execute("SELECT nodes, depth, score FROM students WHERE id = ?", (student_id,))
                stud = cursor.fetchone()
                current_nodes = stud["nodes"] if stud else 0
                current_depth = stud["depth"] if stud else 0
                current_score = stud["score"] if stud else 0

                new_nodes_cnt = current_nodes + 1
                new_depth = round(current_depth + 0.3, 1)
                new_score = min(100, current_score + 1)
                new_node_id = f"n{new_nodes_cnt}"
                
                cursor.execute("""
                    UPDATE students 
                    SET nodes = ?, depth = ?, score = ?
                    WHERE id = ?
                """, (new_nodes_cnt, new_depth, new_score, student_id))

                # Create AI reply
                reply_text = f"Argumento registrado para el nodo {new_node_id}. Tu análisis sobre '{text}' ha sido procesado por el motor cognitivo. ¿Deseas expandir esta rama o consolidar con la principal?"
                reply_id = f"ai_{msg_id}"
                
                lower_text = text.lower()
                concepts = []
                formula = None
                formula_note = None

                if "dilatación" in lower_text or "tiempo" in lower_text:
                    reply_text = "La dilatación del tiempo revela cómo la métrica de Minkowski unifica espacio y tiempo. Desde el frame estacionario, el intervalo temporal propio se dilata según el factor γ. ¿Qué opinas del comportamiento límite para v → c?"
                    concepts = [{"id": f"c_{msg_id}_1", "label": "Dilatación de Lorentz", "type": "concept"}]
                    formula = "Δt' = γ · Δt"
                    formula_note = "El tiempo propio es un invariante geométrico en la geodésica."
                elif "contracción" in lower_text or "longitud" in lower_text:
                    reply_text = "La contracción de Lorentz ocurre solo en la dirección del movimiento relativo. La longitud medida disminuye por el factor 1/γ para preservar la velocidad de la luz c. ¿Cómo afecta esto a la simultaneidad de los extremos?"
                    concepts = [{"id": f"c_{msg_id}_1", "label": "Contracción de longitud", "type": "concept"}]
                    formula = "L' = L / γ"
                elif "conos" in lower_text or "luz" in lower_text or "causalidad" in lower_text:
                    reply_text = "Los conos de luz dividen el espacio-tiempo de Minkowski en pasado, futuro y la región inaccesible causalmente. Los intervalos tipo espacio quedan fuera. ¿Ves alguna forma de violar causalidad sin violar la velocidad de la luz?"
                    concepts = [{"id": f"c_{msg_id}_1", "label": "Cono de luz", "type": "concept"}]
                elif "minkowski" in lower_text or "métrica" in lower_text:
                    reply_text = "La métrica η_μν = diag(1, -1, -1, -1) define la estructura pseudo-euclídea del espacio-tiempo. A diferencia de la geometría euclídea, los intervalos pueden ser negativos (tipo espacio) o cero (tipo luz)."
                    concepts = [{"id": f"c_{msg_id}_1", "label": "Métrica de Minkowski", "type": "concept"}]

                concepts_json = json.dumps(concepts)
                cursor.execute("""
                    INSERT INTO chat_messages (id, student_id, role, timestamp, nodeId, text, formula, formulaNote, concepts)
                    VALUES (?, ?, 'ai', ?, ?, ?, ?, ?, ?)
                """, (reply_id, student_id, timestamp, new_node_id, reply_text, formula, formula_note, concepts_json))

                # Insert node
                node_hash = f"0x{hashlib.md5(text.encode()).hexdigest()[:4]}"
                cursor.execute("""
                    INSERT OR REPLACE INTO graph_nodes (id, student_id, label, type, hash, module, isRoot)
                    VALUES (?, ?, ?, 'branch', ?, 'synaptrac', 0)
                """, (new_node_id, student_id, text[:8] + "…", node_hash))

                # Insert edge
                cursor.execute("SELECT id FROM graph_nodes WHERE student_id = ? AND id != ? ORDER BY rowid DESC LIMIT 1", (student_id, new_node_id))
                prev_node = cursor.fetchone()
                source_id = prev_node["id"] if prev_node else "root"
                cursor.execute("""
                    INSERT INTO graph_edges (student_id, source, target, label)
                    VALUES (?, ?, ?, 'responde')
                """, (student_id, source_id, new_node_id))

                # Ledger event
                block_num = 1247835 + new_nodes_cnt
                evt_id = f"e_{reply_id}"
                cursor.execute("""
                    INSERT INTO axiom_events (id, block, ts, type, module, student, hash, payload)
                    VALUES (?, ?, ?, 'NODE_CREATED', 'synaptrac', ?, ?, ?)
                """, (evt_id, block_num, timestamp, student_id, node_hash, json.dumps({
                    "student": student_id,
                    "note": f"Creado nodo {new_node_id} en discusión '{text[:25]}'",
                    "depth": new_depth
                })))

                conn.commit()

                response_data = {
                    "student_message": {
                        "id": msg_id, "role": "student", "timestamp": timestamp, "text": text, "concepts": []
                    },
                    "ai_message": {
                        "id": reply_id, "role": "ai", "timestamp": timestamp, "nodeId": new_node_id,
                        "text": reply_text, "formula": formula, "formulaNote": formula_note, "concepts": concepts
                    },
                    "graph_node": {
                        "id": new_node_id, "label": text[:8] + "…", "type": "branch", "hash": node_hash, "module": "synaptrac"
                    },
                    "graph_edge": {
                        "source": source_id, "target": new_node_id, "label": "responde"
                    }
                }

        elif route == "/api/chat/graph" and method == "GET":
            student_id = query.get("student_id", ["JD"])[0]
            cursor.execute("SELECT id, label, type, hash, module, isRoot FROM graph_nodes WHERE student_id = ?", (student_id,))
            nodes = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute("SELECT source, target, label FROM graph_edges WHERE student_id = ?", (student_id,))
            edges = [dict(row) for row in cursor.fetchall()]

            response_data = {"nodes": nodes, "edges": edges}

        elif route == "/api/chat/dc-action" and method == "POST":
            payload = json.loads(body_data) if body_data else {}
            student_id = payload.get("student_id", "JD")
            action = payload.get("action", "divergir")
            node_id = payload.get("nodeId", "root")
            timestamp = payload.get("timestamp") or "12:00:00"

            cursor.execute("SELECT nodes, depth, score FROM students WHERE id = ?", (student_id,))
            stud = cursor.fetchone()
            nodes_cnt = stud["nodes"] if stud else 0
            current_depth = stud["depth"] if stud else 0
            current_score = stud["score"] if stud else 0

            new_nodes_cnt = nodes_cnt + 1
            new_depth = round(current_depth + (0.5 if action == "divergir" else 0.1), 1)
            new_score = min(100, current_score + (3 if action == "divergir" else 5))
            new_node_id = f"n{new_nodes_cnt}"
            
            cursor.execute("""
                UPDATE students 
                SET nodes = ?, depth = ?, score = ?
                WHERE id = ?
            """, (new_nodes_cnt, new_depth, new_score, student_id))

            # Create node
            node_hash = f"0x{hashlib.md5(f'{action}_{new_node_id}'.encode()).hexdigest()[:4]}"
            lbl = "Diverge" if action == "divergir" else "Converge"
            cursor.execute("""
                INSERT OR REPLACE INTO graph_nodes (id, student_id, label, type, hash, module, isRoot)
                VALUES (?, ?, ?, 'branch', ?, 'synaptrac', 0)
            """, (new_node_id, student_id, lbl, node_hash))

            # Connect
            cursor.execute("""
                INSERT OR REPLACE INTO graph_edges (student_id, source, target, label)
                VALUES (?, ?, ?, ?)
            """, (student_id, node_id, new_node_id, "deriva" if action == "divergir" else "sintetiza"))

            # Confirm AI msg
            confirm_text = (
                f"Rama divergente creada. El nodo {new_node_id} fue añadido a tu grafo. Desarrolla el argumento — cada nivel de profundidad incrementa tu score académico."
                if action == "divergir" else
                f"Insight convergido con la rama actual. La síntesis argumentativa fue registrada. Hash pendiente de confirmación en Axiom L2."
            )
            confirm_id = f"sys_{int(time.time() * 1000)}"
            cursor.execute("""
                INSERT INTO chat_messages (id, student_id, role, timestamp, nodeId, text, concepts)
                VALUES (?, ?, 'ai', ?, ?, ?, '[]')
            """, (confirm_id, student_id, timestamp, new_node_id, confirm_text))

            # Ledger event
            block_num = 1247835 + new_nodes_cnt
            evt_id = f"e_{confirm_id}"
            cursor.execute("""
                INSERT INTO axiom_events (id, block, ts, type, module, student, hash, payload)
                VALUES (?, ?, ?, ?, 'synaptrac', ?, ?, ?)
            """, (evt_id, block_num, timestamp, action.upper(), student_id, node_hash, json.dumps({
                "student": student_id,
                "node": new_node_id,
                "action": action,
                "insight": "D/C Action triggered"
            })))

            conn.commit()
            response_data = {
                "success": True, 
                "nodeId": new_node_id, 
                "message": {
                    "id": confirm_id, "role": "ai", "timestamp": timestamp, "nodeId": new_node_id, "text": confirm_text, "concepts": []
                }
            }

        elif route == "/api/kmerge/lines" and method == "GET":
            cursor.execute("SELECT text, author, type, indent FROM kmerge_lines ORDER BY id ASC")
            response_data = [dict(row) for row in cursor.fetchall()]

        elif route == "/api/kmerge/commits" and method == "GET":
            cursor.execute("SELECT hash, author, msg, ts, branch, lines FROM kmerge_commits ORDER BY rowid DESC")
            response_data = [dict(row) for row in cursor.fetchall()]

        elif route == "/api/kmerge/commit" and method == "POST":
            payload = json.loads(body_data) if body_data else {}
            msg = payload.get("msg", "")
            author = payload.get("author", "JD")
            branch = payload.get("branch", "main")
            timestamp = payload.get("timestamp") or "hace unos segundos"

            if not msg.strip():
                status_code = 400
                response_data = {"error": "Message is empty"}
            else:
                commit_hash = hashlib.md5(msg.encode()).hexdigest()[:4]
                lines_changed = "+2 -1"
                
                # Insert commit
                cursor.execute("""
                    INSERT INTO kmerge_commits (hash, author, msg, ts, branch, lines)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (commit_hash, author, msg, timestamp, branch, lines_changed))

                # Add simulated doc line
                cursor.execute("""
                    INSERT INTO kmerge_lines (text, author, type, indent)
                    VALUES (?, ?, 'body', 0)
                """, (f"% Commit {commit_hash}: {msg}", author))

                # Add ledger event
                cursor.execute("SELECT COUNT(*) FROM axiom_events")
                ev_cnt = cursor.fetchone()[0]
                block_num = 1247835 + ev_cnt
                evt_id = f"e_{commit_hash}"
                cursor.execute("""
                    INSERT INTO axiom_events (id, block, ts, type, module, student, hash, payload)
                    VALUES (?, ?, 'Ahora', 'COMMIT_MERGED', 'kmerge', ?, ?, ?)
                """, (evt_id, block_num, author, f"0x{commit_hash}f2a8", json.dumps({
                    "student": author, "file": "Lorentz_Force.tex", "lines": lines_changed, "msg": msg
                })))

                conn.commit()
                response_data = {"hash": commit_hash, "lines": lines_changed, "success": True}

        elif route == "/api/discursus/transcript" and method == "GET":
            cursor.execute("SELECT id, speaker, time, text, extracted FROM discursus_transcript ORDER BY id ASC")
            response_data = [dict(row) for row in cursor.fetchall()]

        elif route == "/api/discursus/extract" and method == "POST":
            payload = json.loads(body_data) if body_data else {}
            t_id = payload.get("id", "")
            
            cursor.execute("SELECT extracted, speaker, text FROM discursus_transcript WHERE id = ?", (t_id,))
            row = cursor.fetchone()
            if not row:
                status_code = 404
                response_data = {"error": "Transcript line not found"}
            else:
                new_extracted = 0 if row["extracted"] else 1
                cursor.execute("UPDATE discursus_transcript SET extracted = ? WHERE id = ?", (new_extracted, t_id))
                
                if new_extracted:
                    node_hash = f"0x{hashlib.md5(row['text'].encode()).hexdigest()[:4]}"
                    cursor.execute("SELECT COUNT(*) FROM axiom_events")
                    block_num = 1247835 + cursor.fetchone()[0]
                    evt_id = f"e_ext_{t_id}"
                    cursor.execute("""
                        INSERT INTO axiom_events (id, block, ts, type, module, student, hash, payload)
                        VALUES (?, ?, 'Ahora', 'VOICE_NODE', 'discursus', 'JD', ?, ?)
                    """, (evt_id, block_num, f"{node_hash}b5c4", json.dumps({
                        "student": "JD",
                        "session": "d-07",
                        "fragment": row["speaker"],
                        "duration_s": 25
                    })))
                    cursor.execute("UPDATE students SET nodes = nodes + 1, score = MIN(100, score + 2) WHERE id = 'JD'")

                conn.commit()
                response_data = {"id": t_id, "extracted": bool(new_extracted), "success": True}

        elif route == "/api/professor/students" and method == "GET":
            cursor.execute("SELECT id, name, module, depth, nodes, score, status, lastHash, topic, grade, verified, lastBlock FROM students")
            response_data = [dict(row) for row in cursor.fetchall()]

        elif route == "/api/professor/update-student" and method == "POST":
            payload = json.loads(body_data) if body_data else {}
            s_id = payload.get("id", "")
            status = payload.get("status")
            grade = payload.get("grade")
            score = payload.get("score")
            
            updates = []
            params = []
            if status is not None:
                updates.append("status = ?")
                params.append(status)
            if grade is not None:
                updates.append("grade = ?")
                params.append(grade)
            if score is not None:
                updates.append("score = ?")
                params.append(int(score))
                
            if not updates:
                status_code = 400
                response_data = {"error": "No fields to update"}
            else:
                params.append(s_id)
                q = f"UPDATE students SET {', '.join(updates)} WHERE id = ?"
                cursor.execute(q, tuple(params))
                conn.commit()
                response_data = {"success": True}

        elif route.startswith("/api/professor/chat/") and method == "GET":
            student_id = route.split("/")[-1]
            cursor.execute("""
                SELECT id, role, timestamp, nodeId, text, formula, formulaNote, concepts 
                FROM chat_messages 
                WHERE student_id = ? 
                ORDER BY timestamp ASC
            """, (student_id,))
            messages = []
            for row in cursor.fetchall():
                msg = dict(row)
                msg["concepts"] = json.loads(msg["concepts"] or "[]")
                messages.append(msg)
            response_data = messages

        elif route.startswith("/api/professor/graph/") and method == "GET":
            student_id = route.split("/")[-1]
            cursor.execute("SELECT id, label, type, hash, module, isRoot FROM graph_nodes WHERE student_id = ?", (student_id,))
            nodes = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute("SELECT source, target, label FROM graph_edges WHERE student_id = ?", (student_id,))
            edges = [dict(row) for row in cursor.fetchall()]

            response_data = {"nodes": nodes, "edges": edges}

        elif route == "/api/axiom/events" and method == "GET":
            cursor.execute("SELECT id, block, ts, type, module, student, hash, payload FROM axiom_events ORDER BY block DESC")
            response_data = [dict(row) for row in cursor.fetchall()]

        elif route == "/api/axiom/mine" and method == "POST":
            payload = json.loads(body_data) if body_data else {}
            student_id = payload.get("student_id", "JD")
            
            cursor.execute("SELECT MAX(block) FROM axiom_events")
            max_block = cursor.fetchone()[0] or 1247835
            new_block = max_block + 1
            
            evt_id = f"m_{new_block}"
            h = hashlib.sha256(f"{new_block}_{time.time()}".encode()).hexdigest()[:12]
            cursor.execute("""
                INSERT OR REPLACE INTO axiom_events (id, block, ts, type, module, student, hash, payload)
                VALUES (?, ?, 'Ahora', 'REVISION_L2', 'synaptrac', ?, ?, ?)
            """, (evt_id, new_block, student_id, f"0x{h}", json.dumps({
                "revisor": "Protocol L2",
                "target": student_id,
                "grade": "A",
                "dictamen": "Sealed block generated by engine",
                "block_ref": f"#{max_block}"
            })))
            
            cursor.execute("UPDATE students SET verified = 1, lastBlock = ? WHERE id = ?", (new_block, student_id))
            conn.commit()
            response_data = {"block": new_block, "hash": f"0x{h}", "success": True}

        elif route == "/api/revisor/students" and method == "GET":
            cursor.execute("SELECT id, name, score, nodes, depth, verified, lastBlock, topic, grade FROM students")
            response_data = [dict(row) for row in cursor.fetchall()]

        elif route.startswith("/api/revisor/hashes/") and method == "GET":
            student_id = route.split("/")[-1]
            cursor.execute("""
                SELECT block, type, hash, ts, module, payload 
                FROM axiom_events 
                WHERE student = ? 
                ORDER BY block DESC
            """, (student_id,))
            response_data = [dict(row) for row in cursor.fetchall()]

        elif route == "/api/revisor/verify-hash" and method == "POST":
            payload = json.loads(body_data) if body_data else {}
            h_in = payload.get("hash", "").strip()
            
            cursor.execute("""
                SELECT id, block, ts, type, module, student, hash, payload 
                FROM axiom_events 
                WHERE hash = ? OR hash LIKE ?
            """, (h_in, f"%{h_in}%"))
            row = cursor.fetchone()
            if row:
                response_data = {"found": True, "event": dict(row)}
            else:
                response_data = {"found": False}

        else:
            status_code = 404
            response_data = {"error": f"API Route not found: {route} {method}"}
            
    except Exception as e:
        status_code = 500
        response_data = {"error": str(e), "trace": traceback.format_exc()}
        print(f"API Error: {e}")
        traceback.print_exc()

    conn.close()
    return status_code, response_data

class LorentzHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/"):
            status_code, data = handle_api(self.path, "GET", None)
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        self.serve_file()

    def do_POST(self):
        if self.path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            body_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else None
            
            status_code, data = handle_api(self.path, "POST", body_data)
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        self.send_response(405)
        self.end_headers()

    def serve_file(self):
        clean_path = self.path.split("?")[0].split("#")[0]
        if clean_path == "/" or not clean_path:
            clean_path = "/Lorentz.html"

        root_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.abspath(os.path.join(root_dir, clean_path.lstrip("/")))

        if not file_path.startswith(root_dir):
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"Forbidden")
            return

        if not os.path.exists(file_path) or os.path.isdir(file_path):
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"File not found")
            return

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = "application/octet-stream"

            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Internal Server Error: {e}".encode())


def run(port=8000):
    init_db()
    server_address = ("", port)
    httpd = ThreadingHTTPServer(server_address, LorentzHandler)
    print(f"Lorentz.ai backend running on http://localhost:{port} (PID: {os.getpid()})")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run(port)

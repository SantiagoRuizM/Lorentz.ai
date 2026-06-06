// Nexus.jsx — Árbol de conocimiento · fuente de verdad científica
const { useState } = React;

const ERA = {
  ancient:      { label: 'Antigüedad',        color: '#C8962D', bg: 'rgba(200,150,45,0.12)',  border: 'rgba(200,150,45,0.35)'  },
  early_modern: { label: 'Moderna Temprana',  color: '#5BAADE', bg: 'rgba(91,170,222,0.12)',  border: 'rgba(91,170,222,0.35)'  },
  classical:    { label: 'Física Clásica',    color: '#2EBC8B', bg: 'rgba(46,188,139,0.12)',  border: 'rgba(46,188,139,0.35)'  },
  relativity:   { label: 'Relatividad',       color: '#9B8AFF', bg: 'rgba(155,138,255,0.12)', border: 'rgba(155,138,255,0.35)' },
  quantum:      { label: 'Mecánica Cuántica', color: '#4DECAA', bg: 'rgba(77,236,170,0.12)',  border: 'rgba(77,236,170,0.35)'  },
  field_theory: { label: 'Teoría de Campos',  color: '#C49AFF', bg: 'rgba(196,154,255,0.12)', border: 'rgba(196,154,255,0.35)' },
  modern:       { label: 'Física Moderna',    color: '#4DD8F8', bg: 'rgba(77,216,248,0.12)',  border: 'rgba(77,216,248,0.35)'  },
};

// helper: build node object
const N = (id, short, author, year, era, type, abstract='', ref='', significance='') =>
  ({ id, short, author, year, era, type, abstract, ref, significance });

const NODES = {};
[
  N('aristotle','Physica','Aristóteles','~350 a.C.','ancient','Tratado','Primer sistema coherente de filosofía natural. Las cuatro causas (material, formal, eficiente, final) como marco explicativo de toda la naturaleza. El movimiento como acto de lo que está en potencia. Domina la ciencia occidental 2000 años.','Aristóteles. Physica. c. 350 a.C.','Primer sistema físico coherente. Marco conceptual de toda ciencia hasta Galileo.'),
  N('euclid','Elementos','Euclides','~300 a.C.','ancient','Tratado','13 libros que formalizan la geometría deductiva a partir de 5 postulados. Introduce el método axiomático que domina las matemáticas hasta hoy.','Euclides. Stoicheia. c. 300 a.C.','Fundación del método axiomático-deductivo en matemáticas.'),
  N('archimedes','Flotantes','Arquímedes','~250 a.C.','ancient','Tratado','Principio de Arquímedes: el empuje es igual al peso del fluido desplazado. Método exhaustivo precursor del cálculo integral.','Arquímedes. On Floating Bodies. c. 250 a.C.','Primera hidrostática. Precursor del cálculo integral.'),
  N('ptolemy','Almagesto','Ptolomeo','~150 d.C.','ancient','Libro','Sistema geocéntrico con epiciclos. Predice posiciones planetarias con notable precisión durante 1400 años.','Ptolomeo. Almagestum. c. 150 d.C.','Paradigma cosmológico dominante por 14 siglos.'),
  N('copernicus','De Revolutionibus','Copérnico','1543','early_modern','Libro','El Sol, no la Tierra, está en el centro. Órbitas circulares. Publicado en su lecho de muerte para evitar censura.','Copernicus. De Revolutionibus Orbium Coelestium. 1543.','Detonante de la Revolución Científica.'),
  N('tycho','Astronomia Instaurata','Tycho Brahe','1588','early_modern','Observ.','Las observaciones astronómicas más precisas antes del telescopio. Base empírica de Kepler.','Brahe, T. Astronomiae Instauratae. 1588.','Datos sin precedentes que permiten a Kepler descubrir las leyes planetarias.'),
  N('kepler','Astronomia Nova','Kepler','1609','early_modern','Libro','Primera y segunda ley: órbitas elípticas con el Sol en un foco; ley de las áreas. Fin de los círculos perfectos.','Kepler, J. Astronomia Nova. 1609.','Primera ley matemática exacta del movimiento planetario.'),
  N('kepler3','Harmonices Mundi','Kepler','1619','early_modern','Libro','Tercera ley de Kepler: T² ∝ a³. Relación entre período y semieje mayor de la órbita.','Kepler, J. Harmonices Mundi. 1619.','Tercera ley. Precursora de la gravitación universal de Newton.'),
  N('galileo','Discorsi (1638)','Galileo','1638','early_modern','Libro','Leyes del movimiento acelerado. Principio de relatividad galileana: las leyes mecánicas son iguales en todo marco inercial.','Galilei, G. Discorsi. 1638.','Fundación de la mecánica clásica y el método experimental.'),
  N('torricelli','Barómetro','Torricelli','1643','early_modern','Experimento','Primer barómetro: columna de mercurio de 76 cm mide la presión atmosférica. Primer vacío artificial.','Torricelli, E. Opera Geometrica. 1644.','Demuestra la presión atmosférica. Precursor de la termodinámica.'),
  N('pascal','Traité Pression','Pascal','1653','early_modern','Tratado','Ley de Pascal: la presión se transmite íntegramente en fluidos. Principio de la prensa hidráulica.','Pascal, B. Traités de l\'équilibre des liqueurs. 1663.','Hidrostática cuantitativa. Base de la hidráulica moderna.'),
  N('huygens','Traité Lumière','Huygens','1690','early_modern','Libro','Principio de Huygens: cada punto de un frente de onda es fuente de ondas secundarias. Explica reflexión y refracción.','Huygens, C. Traité de la Lumière. 1690.','Teoría ondulatoria de la luz. Principio fundamental de óptica.'),
  N('hooke','Ley Elasticidad','Hooke','1678','early_modern','Artículo','Ley de Hooke: F = kx. La fuerza restauradora es proporcional a la deformación.','Hooke, R. De Potentia Restitutiva. 1678.','Elasticidad cuantitativa. Fundación de la mecánica de materiales.'),
  N('newton','Principia','Newton','1687','early_modern','Libro','F=ma, F=GMm/r². Unifica mecánica terrestre y celeste. Espacio y tiempo absolutos. Sistema físico dominante 200 años.','Newton, I. Principia Mathematica. 1687.','El sistema físico más completo hasta la relatividad.'),
  N('leibniz','Cálculo Diferencial','Leibniz','1684','early_modern','Artículo','Notación dy/dx y ∫. Cálculo diferencial e integral independiente de Newton. La notación moderna es la de Leibniz.','Leibniz, G.W. Nova Methodus. Acta Eruditorum, 1684.','Notación moderna del cálculo usada hasta hoy.'),
  N('bernoulli','Hydrodynamica','Bernoulli','1738','classical','Libro','P + ½ρv² + ρgh = cte. Conservación de energía en fluidos incompresibles.','Bernoulli, D. Hydrodynamica. 1738.','Fundación de la hidrodinámica. Base de la aeronáutica.'),
  N('euler','Mechanica','Euler','1736','classical','Libro','Formulación analítica de la mecánica. Ecuaciones de movimiento en coordenadas generalizadas.','Euler, L. Mechanica. 1736.','Analitización de la mecánica. Más de 800 publicaciones.'),
  N('lagrange','Mécanique Analytique','Lagrange','1788','classical','Libro','Principio de mínima acción. Ecuaciones de Lagrange. Mecánica sin vectores de fuerza.','Lagrange, J.L. Mécanique Analytique. 1788.','Reformulación variacional. Base del formalismo hamiltoniano y cuántico.'),
  N('laplace','Mécanique Céleste','Laplace','1799','classical','Libro','Ecuación de Laplace ∇²φ=0. Determinismo absoluto: dadas condiciones iniciales, el futuro es predecible.','Laplace, P.S. Mécanique Céleste. 1799–1825.','Determinismo clásico. Potencial gravitacional. Transformada de Laplace.'),
  N('fourier','Théorie Chaleur','Fourier','1822','classical','Libro','La temperatura puede expresarse como suma de senos y cosenos. Serie de Fourier. Ecuación de calor.','Fourier, J. Théorie Analytique de la Chaleur. 1822.','Series de Fourier. Fundamental en física, ingeniería y procesamiento de señales.'),
  N('hamilton','Mecánica Hamilton','Hamilton','1833','classical','Artículo','H(q,p)=T+V. Ecuaciones de Hamilton. Formulación en espacio de fases.','Hamilton, W.R. Phil. Trans. R. Soc. London. 1834.','Mecánica hamiltoniana. Base del formalismo de la mecánica cuántica.'),
  N('carnot','Réflexions','Carnot','1824','classical','Libro','Ciclo de Carnot: η_max = 1 - T_c/T_h. Límite termodinámico de eficiencia.','Carnot, S. Réflexions sur la Puissance Motrice du Feu. 1824.','Primera ley de la termodinámica. Límite de Carnot.'),
  N('clausius','2da Ley','Clausius','1850','classical','Artículo','Segunda ley: dS ≥ δQ/T. La entropía de un sistema aislado siempre aumenta. Dirección del tiempo.','Clausius, R. Annalen der Physik. 79, 368 (1850).','Definición de entropía. Dirección termodinámica del tiempo.'),
  N('kelvin','Temperatura Abs.','Kelvin','1848','classical','Artículo','Escala de temperatura absoluta (K). Co-formulador de la segunda ley de la termodinámica.','Thomson, W. Trans. Roy. Soc. Edinburgh. 1848.','Escala absoluta de temperatura. Segunda ley.'),
  N('faraday','Inducción EM','Faraday','1831','classical','Artículo','Inducción electromagnética: un campo B variable genera campo E. Ley de Faraday: ε = -dΦ/dt.','Faraday, M. Phil. Trans. R. Soc. London. 1831.','Fundación del electromagnetismo experimental. Precursor directo de Maxwell.'),
  N('boltzmann','H-theorem','Boltzmann','1872','classical','Artículo','H-teorema: irreversibilidad macroscópica de leyes reversibles. S = k·log(W). Mecánica estadística.','Boltzmann, L. Wiener Berichte. 66, 275 (1872).','Fundación de la mecánica estadística. Interpretación atomista de la entropía.'),
  N('gibbs','Mec. Estadística','Gibbs','1902','classical','Libro','Ensambles estadísticos. Energía libre G = H - TS. Potencial químico.','Gibbs, J.W. Elementary Principles in Statistical Mechanics. 1902.','Mecánica estadística moderna. Energía libre de Gibbs.'),
  N('maxwell','Dynamical Theory EM','Maxwell','1865','classical','Artículo','Las cuatro ecuaciones de Maxwell unifican electricidad, magnetismo y óptica. Predice c ≈ 3×10⁸ m/s como constante universal.','Maxwell, J.C. Phil. Trans. R. Soc. 155, 459 (1865).','Primera gran unificación de fuerzas. La constancia de c siembra la relatividad.'),
  N('hertz','Ondas EM','Hertz','1887','classical','Artículo','Primera producción y detección experimental de ondas EM, confirmando las predicciones de Maxwell.','Hertz, H. Annalen der Physik. 31, 421 (1887).','Confirmación experimental de Maxwell. Base de las telecomunicaciones.'),
  N('röntgen','Rayos X','Röntgen','1895','classical','Artículo','Descubrimiento de los rayos X. Primera radiografía de una mano. Primer Nobel de Física (1901).','Röntgen, W.C. Sitzungsber. Würzburger Physik. 1895.','Revolución en medicina diagnóstica y cristalografía.'),
  N('michelson','Michelson-Morley','Michelson','1887','classical','Experim.','Resultado nulo: la velocidad de la luz es la misma en todas las direcciones. El éter no existe. El experimento más famoso por su fracaso.','Michelson & Morley. Am. J. Sci. 34, 333 (1887).','Imposibilita el éter y el espacio absoluto. Exige nueva física.'),
  N('becquerel','Radioactividad','Becquerel','1896','classical','Artículo','Descubrimiento de la radioactividad espontánea del uranio sin fuente de energía externa aparente.','Becquerel, H. Comptes Rendus. 122, 501 (1896).','Abre la física nuclear. Primer Nobel compartido con los Curie.'),
  N('curie','Polonio & Radio','Curie','1898','classical','Artículo','Descubrimiento del polonio y el radio. Acuñación del término "radioactividad". Aislamiento de elementos radiactivos.','Curie, M. & Curie, P. Comptes Rendus. 127, 175 (1898).','Única persona con dos Nobel científicos. Funda la física y química nucleares.'),
  N('lorentz','EM Moving Systems','Lorentz','1904','relativity','Artículo','Transformaciones de Lorentz: t\'=γ(t-vx/c²), x\'=γ(x-vt). Contracción de longitud y dilatación temporal como efectos reales.','Lorentz, H.A. Proc. Acad. Sci. Amsterdam. 6, 809 (1904).','Matemáticas completas de la relatividad especial. Falta la interpretación física.'),
  N('poincare','Sur la Dynamique','Poincaré','1905','relativity','Artículo','Principio de relatividad formalizado. Grupo de Lorentz como grupo de Lie. Invariancia de las leyes físicas.','Poincaré, H. Rendiconti Palermo. 21, 129 (1906).','Formulación matemática casi completa. Faltó eliminar el éter.'),
  N('planck','Cuanto de Acción','Planck','1900','quantum','Artículo','E = hν. La energía se emite en cuantos discretos. Solución a la catástrofe ultravioleta del cuerpo negro.','Planck, M. Annalen der Physik. 4, 553 (1901).','Nacimiento de la física cuántica. h = 6.626×10⁻³⁴ J·s.'),
  N('einstein_pe','Efecto Fotoeléctrico','Einstein','1905','quantum','Artículo','La luz son fotones con E = hν. Explica el efecto fotoeléctrico. Nobelado en 1921 por este trabajo, no por la relatividad.','Einstein, A. Annalen der Physik. 17, 132 (1905).','Nobel 1921. Dualidad onda-partícula de la luz.'),
  N('einstein_sr','Zur Elektrodynamik (SR)','Einstein','1905','relativity','Artículo','Dos postulados: leyes físicas idénticas en marcos inerciales; c constante para todo observador. Elimina el éter. E=mc².','Einstein, A. Annalen der Physik. 17, 891 (1905).','Ruptura conceptual más profunda desde Newton. Elimina espacio y tiempo absolutos.'),
  N('einstein_gr','Feldgleichungen (GR)','Einstein','1915','relativity','Artículo','G_μν = (8πG/c⁴)T_μν. La gravedad es curvatura del espacio-tiempo. Predice la precesión de Mercurio y la deflexión de la luz.','Einstein, A. Sitzungsberichte Preuss. Akad. 844 (1915).','La teoría más elegante de la física. Redefine gravedad como geometría.'),
  N('minkowski','Raum und Zeit','Minkowski','1908','relativity','Conferencia','Espacio-tiempo tetradimensional ds²=c²dt²−dx²−dy²−dz². El intervalo es invariante Lorentz.','Minkowski, H. Physik. Zeitschrift. 10, 104 (1909).','Geometría del espacio-tiempo. Lenguaje matemático de la física moderna.'),
  N('eddington','Deflexión Luz','Eddington','1919','relativity','Observ.','Confirmación experimental de la GR: la luz se desvía al pasar cerca del Sol, eclipse de 1919.','Dyson, Eddington, Davidson. Phil. Trans. R. Soc. A. 220, 291 (1920).','Primera confirmación de la Relatividad General. Einstein se vuelve celebridad mundial.'),
  N('rutherford','Modelo Nuclear','Rutherford','1911','quantum','Artículo','El átomo tiene un núcleo pequeño y denso. La mayoría del átomo es espacio vacío.','Rutherford, E. Phil. Mag. 21, 669 (1911).','Descubrimiento del núcleo atómico. Fin del modelo de Thomson.'),
  N('bohr','Modelo Atómico','Bohr','1913','quantum','Artículo','Órbitas cuantizadas: E_n = −13.6/n² eV. Explica exactamente el espectro del hidrógeno.','Bohr, N. Phil. Mag. 26, 1 (1913).','Primer modelo cuántico del átomo. Nobel 1922.'),
  N('de_broglie','Materia-Onda','de Broglie','1924','quantum','Tesis','λ = h/p. La materia tiene propiedades ondulatorias. Dualidad onda-partícula es universal.','de Broglie, L. Thesis. Univ. Paris (1924).','Dualidad onda-corpúsculo universal. Nobel 1929.'),
  N('compton','Efecto Compton','Compton','1923','quantum','Artículo','La dispersión de rayos X por electrones confirma que los fotones tienen cantidad de movimiento p=h/λ.','Compton, A.H. Phys. Rev. 21, 483 (1923).','Confirma el fotón como partícula. Nobel 1927.'),
  N('pauli','Exclusión','Pauli','1925','quantum','Artículo','Dos fermiones no pueden tener los mismos números cuánticos. Explica la tabla periódica.','Pauli, W. Zeitschrift für Physik. 31, 765 (1925).','Principio de exclusión. Explica la estructura electrónica. Nobel 1945.'),
  N('heisenberg','Mec. Matricial','Heisenberg','1925','quantum','Artículo','Primera formulación de la QM. [x̂,p̂]=iℏ. Principio de incertidumbre: ΔxΔp ≥ ℏ/2.','Heisenberg, W. Zeitschrift für Physik. 33, 879 (1925).','Mecánica matricial. Principio de incertidumbre. Nobel 1932.'),
  N('schrodinger','Quantisierung','Schrödinger','1926','quantum','Artículo','iℏ∂ψ/∂t = Ĥψ. La función de onda ψ describe el estado cuántico. Probabilidad |ψ(x)|².','Schrödinger, E. Annalen der Physik. 79, 361 (1926).','Ecuación fundamental de la QM no-relativista. Nobel 1933.'),
  N('born','Interpretación ψ','Born','1926','quantum','Artículo','|ψ(x)|² es la densidad de probabilidad. Interpretación de Copenhague.','Born, M. Zeitschrift für Physik. 37, 863 (1926).','Regla de Born. Interpretación probabilística de la QM. Nobel 1954.'),
  N('dirac','Quantum e⁻','Dirac','1928','field_theory','Artículo','(iγ^μ∂_μ−m)ψ=0. Primera QM relativista. Espín ½ natural. Predice el positrón.','Dirac, P.A.M. Proc. R. Soc. A. 117, 610 (1928).','Unifica QM y SR. Predice la antimateria. Base de QFT. Nobel 1933.'),
  N('anderson_positron','Positrón','Anderson','1932','quantum','Experim.','Descubrimiento experimental del positrón, predicho por Dirac. Primera antipartícula.','Anderson, C.D. Science. 76, 238 (1932).','Primera antimateria observada. Confirma la ecuación de Dirac. Nobel 1936.'),
  N('fermi','Decaimiento Beta','Fermi','1934','field_theory','Artículo','Primera teoría de la fuerza débil: interacción de contacto de cuatro fermiones. Precursor del Modelo Estándar.','Fermi, E. Zeitschrift für Physik. 88, 161 (1934).','Primera teoría de la fuerza débil. Prototipo de teorías de campo efectivo.'),
  N('yukawa','Mesón','Yukawa','1935','field_theory','Artículo','Predice el mesón como portador de la fuerza nuclear fuerte. Primera partícula predicha teóricamente.','Yukawa, H. Proc. Phys. Math. Soc. Japan. 17, 48 (1935).','Primera predicción teórica de una nueva partícula. Nobel 1949.'),
  N('feynman','QED Space-Time','Feynman','1949','field_theory','Artículo','QED con diagramas de Feynman e integrales de camino. Precisión de 12 dígitos en el factor g del electrón.','Feynman, R.P. Phys. Rev. 76, 769 (1949).','La teoría más precisa de la historia. Nobel 1965.'),
  N('schwinger','QED Renorm.','Schwinger','1948','field_theory','Artículo','Formulación covariante de QED. Cálculo del momento anómalo del electrón a/2π.','Schwinger, J. Phys. Rev. 73, 416 (1948).','QED covariante. Co-Nobel 1965.'),
  N('tomonaga','QED Japón','Tomonaga','1946','field_theory','Artículo','Formulación independiente de QED desarrollada en Japón durante la Segunda Guerra Mundial.','Tomonaga, S. Prog. Theor. Phys. 1, 27 (1946).','Tercera formulación de QED. Nobel 1965.'),
  N('yang_mills','Yang-Mills','Yang & Mills','1954','field_theory','Artículo','Gauge invariance no-abeliana SU(N). Los bosones gauge auto-interactúan. Estructura del Modelo Estándar.','Yang & Mills. Phys. Rev. 96, 191 (1954).','Base matemática del Modelo Estándar. Nobel implícito en todos los que vinieron después.'),
  N('nambu','Ruptura Simetría','Nambu','1960','field_theory','Artículo','Ruptura espontánea de simetría en física de partículas. Bosones de Goldstone como consecuencia.','Nambu & Jona-Lasinio. Phys. Rev. 122, 345 (1961).','Mecanismo base del bosón de Higgs. Nobel 2008.'),
  N('gell_mann','Quarks','Gell-Mann','1964','field_theory','Artículo','Hadrones como estados ligados de quarks u, d, s. Número cuántico de "color". El camino óctuple.','Gell-Mann, M. Phys. Lett. 8, 214 (1964).','Descubrimiento teórico de los quarks. Nobel 1969.'),
  N('higgs','Broken Symmetries','Higgs','1964','modern','Artículo','Campo escalar con ⟨φ⟩≠0. W±, Z⁰ adquieren masa. Bosón de Higgs predicho. Descubierto en LHC 2012.','Higgs, P.W. Phys. Rev. Lett. 13, 508 (1964).','Origen de la masa de las partículas. Nobel 2013.'),
  N('glashow','SU(2)xU(1)','Glashow','1961','modern','Artículo','Estructura de gauge SU(2)×U(1) unificando fuerza débil y electromagnetismo.','Glashow, S.L. Nucl. Phys. 22, 579 (1961).','Estructura del Modelo Estándar electrodébil. Nobel 1979.'),
  N('weinberg','Modelo Electrodébil','Weinberg','1967','modern','Artículo','Unificación electrodébil. Predicción de W±, Z⁰ con masas específicas. Confirmado en CERN 1983.','Weinberg, S. Phys. Rev. Lett. 19, 1264 (1967).','Unificación electrodébil. Nobel 1979.'),
  N('gross','Libertad Asintótica','Gross & Wilczek','1973','modern','Artículo','La fuerza fuerte se debilita a altas energías: α_s → 0. QCD como teoría de la fuerza fuerte.','Gross & Wilczek. Phys. Rev. Lett. 30, 1343 (1973).','QCD asintóticamente libre. Nobel 2004.'),
  N('wilson','Grupo Renorm.','Wilson','1971','modern','Artículo','Las propiedades físicas cambian con la escala de energía. Renormalización como flujo en espacio de teorías.','Wilson, K.G. Phys. Rev. B. 4, 3174 (1971).','Grupo de renormalización moderno. Nobel 1982.'),
  N('penrose','Teorema Singularidad','Penrose','1965','modern','Artículo','Bajo condiciones generales de energía positiva, la GR predice singularidades inevitables.','Penrose, R. Phys. Rev. Lett. 14, 57 (1965).','Prueba matemática de que los agujeros negros son inevitables en GR. Nobel 2020.'),
  N('bekenstein','Entropía BH','Bekenstein','1972','modern','Artículo','S_BH = kA/(4l_P²). La entropía del agujero negro es proporcional al área del horizonte.','Bekenstein, J.D. Phys. Rev. D. 7, 2333 (1973).','Termodinámica de agujeros negros. Puente gravedad–cuántica–termodinámica.'),
  N('hawking','Black Hole Exp.','Hawking','1974','modern','Artículo','T_H = ℏc³/(8πGMk_B). Agujeros negros emiten radiación cuántica térmica. Información y paradoja.','Hawking, S.W. Nature. 248, 30 (1974).','Primera predicción en la frontera gravedad–cuántica.'),
  N('witten','M-theory','Witten','1995','modern','Conferencia','M-teoría en 11 dimensiones unifica las 5 teorías de cuerdas. Dualidades S, T, U entre teorías.','Witten, E. Strings 95. USC (1995).','Unificación de las teorías de cuerdas. El paper más citado de física teórica de los 90s.'),
  N('maldacena','AdS/CFT','Maldacena','1997','modern','Artículo','Gravedad en AdS_{n+1} es dual a una CFT en n dimensiones. Holografía cuántica.','Maldacena, J. Int. J. Theor. Phys. 38, 1113 (1999).','El artículo más citado en física de altas energías. Holografía.'),
  N('higgs_lhc','Higgs en LHC','ATLAS & CMS','2012','modern','Artículo','Descubrimiento del bosón de Higgs a 125.25 GeV. Completa el Modelo Estándar de partículas.','ATLAS & CMS. Phys. Lett. B. 716, 1 (2012).','Completa el Modelo Estándar. Nobel 2013.'),
  N('ligo','GW: Fusión BH','LIGO/Virgo','2016','modern','Artículo','GW150914: primera detección de ondas gravitacionales. Fusión de agujeros negros de 36+29 M☉.','Abbott et al. Phys. Rev. Lett. 116, 061102 (2016).','Confirma GR en campo fuerte. Abre astronomía de OGs. Nobel 2017.'),
  N('gw170817','GW: Estrellas NS','LIGO/Virgo','2017','modern','Artículo','Primera fusión de estrellas de neutrones. Kilonova detectada. Origen del oro y platino confirmado.','Abbott et al. Phys. Rev. Lett. 119, 161101 (2017).','Astronomía multi-mensajero. Origen de elementos pesados.'),
  N('eht','Imagen BH M87*','EHT','2019','modern','Artículo','Primera imagen de un agujero negro: M87* de 6.5×10⁹ M☉. Radio de sombra de 40 microarcosegundos.','EHT Collaboration. ApJL 875, L1 (2019).','Primera imagen directa de un agujero negro. Confirma GR en régimen extremo.'),
  N('planck_sat','Parámetros CMB','Planck Collab.','2013','modern','Artículo','Mapa CMB de máxima precisión: Ω_Λ=0.683, Ω_DM=0.268, H₀=67.3 km/s/Mpc. Confirma ΛCDM.','Planck Collaboration. A&A 571, A1 (2014).','Parámetros cosmológicos de precisión. Confirma modelo ΛCDM.'),
  N('webb','JWST Primer Luz','NASA/ESA/CSA','2022','modern','Artículo','Galaxias masivas y maduras a z>10, contradiciendo modelos de formación estelar. El universo temprano sorprende.','Gardner et al. Space Sci. Rev. (2006); Obs. 2022.','Galaxias inesperadamente masivas en el universo temprano. Desafía ΛCDM.'),
].forEach(n => { NODES[n.id] = n; });

// ── Tree levels ───────────────────────────────────────────────────────
const LEVELS = [
  ['aristotle'],
  ['euclid', 'archimedes', 'ptolemy'],
  ['copernicus', 'tycho', 'kepler', 'kepler3', 'galileo'],
  ['torricelli', 'pascal', 'huygens', 'hooke', 'newton', 'leibniz'],
  ['bernoulli', 'euler', 'lagrange', 'laplace', 'fourier', 'hamilton'],
  ['carnot', 'clausius', 'kelvin', 'faraday', 'boltzmann', 'gibbs'],
  ['maxwell', 'hertz', 'röntgen', 'michelson', 'becquerel', 'curie'],
  ['lorentz', 'poincare', 'planck', 'einstein_pe', 'rutherford'],
  ['einstein_sr', 'einstein_gr', 'minkowski', 'eddington', 'bohr'],
  ['de_broglie', 'compton', 'pauli', 'heisenberg', 'schrodinger', 'born'],
  ['dirac', 'anderson_positron', 'fermi', 'yukawa'],
  ['feynman', 'schwinger', 'tomonaga', 'yang_mills'],
  ['nambu', 'gell_mann', 'glashow', 'weinberg', 'gross', 'wilson'],
  ['higgs', 'penrose', 'bekenstein', 'hawking'],
  ['witten', 'maldacena', 'higgs_lhc', 'ligo'],
  ['gw170817', 'eht', 'planck_sat', 'webb'],
];

// fix: some ids have special chars — normalize
const NID = { 'röntgen': 'röntgen' };

// ── Edges ─────────────────────────────────────────────────────────────
const EDGES = [
  ['aristotle','euclid'],['aristotle','archimedes'],['aristotle','ptolemy'],
  ['euclid','copernicus'],['euclid','kepler'],['ptolemy','copernicus'],
  ['copernicus','tycho'],['copernicus','kepler'],['tycho','kepler'],
  ['kepler','kepler3'],['kepler','galileo'],['kepler3','newton'],
  ['galileo','newton'],['galileo','torricelli'],['galileo','pascal'],
  ['huygens','newton'],['hooke','newton'],['newton','leibniz'],
  ['newton','bernoulli'],['newton','euler'],['newton','lagrange'],
  ['newton','laplace'],['leibniz','euler'],['euler','lagrange'],
  ['lagrange','hamilton'],['laplace','fourier'],['laplace','carnot'],
  ['carnot','clausius'],['carnot','kelvin'],['clausius','boltzmann'],
  ['kelvin','boltzmann'],['boltzmann','gibbs'],['faraday','maxwell'],
  ['maxwell','hertz'],['maxwell','michelson'],['maxwell','lorentz'],
  ['maxwell','poincare'],['maxwell','einstein_sr'],['hertz','röntgen'],
  ['röntgen','becquerel'],['becquerel','curie'],['michelson','einstein_sr'],
  ['lorentz','einstein_sr'],['poincare','einstein_sr'],
  ['planck','einstein_pe'],['planck','einstein_sr'],['planck','bohr'],
  ['einstein_pe','bohr'],['einstein_pe','compton'],
  ['einstein_sr','minkowski'],['einstein_sr','einstein_gr'],
  ['einstein_sr','de_broglie'],['einstein_sr','dirac'],
  ['einstein_gr','eddington'],['einstein_gr','penrose'],
  ['einstein_gr','bekenstein'],['einstein_gr','hawking'],
  ['einstein_gr','ligo'],['rutherford','bohr'],
  ['bohr','de_broglie'],['bohr','heisenberg'],['bohr','schrodinger'],
  ['de_broglie','heisenberg'],['de_broglie','schrodinger'],
  ['compton','pauli'],['pauli','dirac'],['heisenberg','born'],
  ['schrodinger','born'],['schrodinger','dirac'],
  ['dirac','anderson_positron'],['dirac','feynman'],['dirac','schwinger'],
  ['dirac','tomonaga'],['fermi','yukawa'],['fermi','feynman'],
  ['feynman','yang_mills'],['schwinger','yang_mills'],['tomonaga','yang_mills'],
  ['yang_mills','nambu'],['yang_mills','gell_mann'],['yang_mills','glashow'],
  ['nambu','higgs'],['glashow','weinberg'],['glashow','higgs'],
  ['weinberg','higgs'],['gell_mann','gross'],['gross','wilson'],
  ['bekenstein','hawking'],['penrose','hawking'],['penrose','witten'],
  ['hawking','witten'],['witten','maldacena'],
  ['higgs','higgs_lhc'],['ligo','gw170817'],['einstein_gr','eht'],
  ['planck_sat','webb'],['hawking','planck_sat'],
];

// ── Layout ────────────────────────────────────────────────────────────
const NW = 86, NH = 22, HGAP = 6, VGAP = 58, PX = 36, PY = 28;

function buildLayout() {
  const pos = {};
  const maxN = Math.max(...LEVELS.map(l => l.length));
  const W = maxN * NW + (maxN - 1) * HGAP + 2 * PX;
  LEVELS.forEach((lvl, li) => {
    const tw = lvl.length * NW + (lvl.length - 1) * HGAP;
    const sx = (W - tw) / 2;
    lvl.forEach((id, ni) => {
      pos[id] = { x: sx + ni * (NW + HGAP), y: PY + li * VGAP };
    });
  });
  const H = PY + (LEVELS.length - 1) * VGAP + NH + PY;
  return { pos, W, H };
}

const { pos: POS, W: CW, H: CH } = buildLayout();

// ── Node chip ─────────────────────────────────────────────────────────
function NodeChip({ node, selected, onClick }) {
  const [hov, setHov] = useState(false);
  const e = ERA[node.era];
  const active = selected || hov;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${node.author} · ${node.year}`}
      style={{
        position: 'absolute',
        left: POS[node.id].x, top: POS[node.id].y,
        width: NW, height: NH,
        background: active ? e.bg : 'var(--card)',
        border: `1px solid ${active ? e.border : 'var(--border)'}`,
        borderLeft: `3px solid ${e.color}`,
        cursor: 'pointer',
        padding: '0 5px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3,
        transition: 'all 140ms ease',
        boxShadow: selected ? `0 0 0 1px ${e.color}55, 0 2px 12px ${e.color}22` : 'none',
        zIndex: selected ? 3 : 2,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <span style={{
        fontSize: 8, fontWeight: 600, color: active ? e.color : 'var(--text-muted)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        lineHeight: 1, flex: 1, transition: 'color 140ms',
      }}>
        {node.short}
      </span>
      <span style={{
        fontSize: 7, fontFamily: 'JetBrains Mono', color: 'var(--text-dim)',
        whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1,
      }}>
        {node.year.replace('~','').replace(' a.C.','').replace(' d.C.','')}
      </span>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────
function DetailPanel({ node, onClose }) {
  const e = ERA[node.era];
  return (
    <div style={{
      width: 300, flexShrink: 0, height: '100%', overflowY: 'auto',
      background: 'var(--deep)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideIn 0.2s ease both',
    }}>
      <div style={{ padding: 'var(--s3)', borderBottom: `2px solid ${e.color}`, background: e.bg, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: e.color, background: e.bg, border: `1px solid ${e.border}`, padding: '2px 5px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{e.label}</span>
            <span style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', background: 'var(--slate)', border: '1px solid var(--border)', padding: '2px 5px', textTransform: 'uppercase' }}>{node.type}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 5, letterSpacing: '-0.02em' }}>{node.short}</div>
        <div style={{ fontSize: 10, color: e.color, fontFamily: 'JetBrains Mono' }}>{node.author} · {node.year}</div>
      </div>

      <div style={{ padding: 'var(--s3)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
        {node.abstract && (
          <div>
            <div className="label" style={{ display: 'block', marginBottom: 6 }}>RESUMEN</div>
            <p style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>{node.abstract}</p>
          </div>
        )}
        {node.significance && (
          <div style={{ background: e.bg, border: `1px solid ${e.border}`, borderLeft: `3px solid ${e.color}`, padding: '8px 10px' }}>
            <div className="label" style={{ display: 'block', color: e.color, marginBottom: 4 }}>IMPORTANCIA</div>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{node.significance}</p>
          </div>
        )}
        {node.ref && (
          <div style={{ padding: '6px 10px', background: 'var(--slate)', border: '1px solid var(--border)' }}>
            <div className="label" style={{ display: 'block', marginBottom: 4 }}>REFERENCIA</div>
            <p style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{node.ref}</p>
          </div>
        )}
        <div>
          <div className="label" style={{ display: 'block', marginBottom: 6 }}>INFLUYE EN</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {EDGES.filter(([f]) => f === node.id).map(([, to]) => {
              const n = NODES[to]; if (!n) return null;
              const te = ERA[n.era];
              return (
                <span key={to} style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: te.color, background: te.bg, border: `1px solid ${te.border}`, padding: '2px 5px' }}>{n.short}</span>
              );
            })}
            {EDGES.filter(([f]) => f === node.id).length === 0 && (
              <span style={{ fontSize: 9, color: 'var(--text-dim)', fontStyle: 'italic' }}>Frontera actual del conocimiento</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────
function NexusScreen() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--void)' }}>

      {/* Tree scroll area */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--s3) var(--s3) var(--s5)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 10, width: CW }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 2 }}>
            Nexus <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>·</span> <span style={{ color: 'var(--violet-bright)' }}>Árbol de Conocimiento</span>
          </h1>
          <p style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>
            FUENTE DE VERDAD · {Object.keys(NODES).length} FUENTES · ARISTÓTELES → FÍSICA MODERNA
          </p>
        </div>

        {/* Era legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12, justifyContent: 'center', width: CW }}>
          {Object.entries(ERA).map(([key, meta]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', background: meta.bg, border: `1px solid ${meta.border}` }}>
              <span style={{ width: 4, height: 4, background: meta.color, borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontSize: 7, fontFamily: 'JetBrains Mono', color: meta.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{meta.label}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ position: 'relative', width: CW, height: CH, flexShrink: 0 }}>

          {/* SVG edges */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: CW, height: CH, pointerEvents: 'none', overflow: 'visible' }}>
            {/* grid dots */}
            <defs>
              <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="rgba(110,84,255,0.05)" />
              </pattern>
            </defs>
            <rect width={CW} height={CH} fill="url(#grid)" />

            {EDGES.map(([from, to], i) => {
              const p = POS[from], q = POS[to];
              if (!p || !q) return null;
              const x1 = p.x + NW / 2, y1 = p.y + NH;
              const x2 = q.x + NW / 2, y2 = q.y;
              const my = (y1 + y2) / 2;
              const isHot = selected && (selected.id === from || selected.id === to);
              const toColor = ERA[NODES[to]?.era]?.color || 'rgba(110,84,255,0.4)';
              return (
                <path
                  key={i}
                  d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
                  stroke={isHot ? toColor : 'rgba(110,84,255,0.12)'}
                  strokeWidth={isHot ? 1.5 : 0.8}
                  strokeDasharray={isHot ? 'none' : '3,4'}
                  fill="none"
                  style={{ transition: 'stroke 150ms, stroke-width 150ms' }}
                />
              );
            })}
          </svg>

          {/* Node chips */}
          {Object.values(NODES).map(node => (
            POS[node.id] && (
              <NodeChip
                key={node.id}
                node={node}
                selected={selected?.id === node.id}
                onClick={() => setSelected(prev => prev?.id === node.id ? null : node)}
              />
            )
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

Object.assign(window, { NexusScreen });

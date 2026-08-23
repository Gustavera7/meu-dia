import type { Drill } from '@/core/types'

/**
 * Exercicios de desenvolvimento motor.
 * Sessoes curtas (5 a 10 min), sem equipamento na maioria dos casos.
 */
const CORE_DRILLS: Drill[] = [
  // ---- Mobilidade ----
  { id: 'mob_quadril_90', name: 'Trocas 90/90 de quadril', category: 'mobilidade', minutes: 2, howTo: 'Sentado, alterne as pernas de um lado para o outro sem usar as maos.' },
  { id: 'mob_toracica', name: 'Rotacao toracica deitado', category: 'mobilidade', minutes: 2, howTo: 'Deitado de lado, joelhos dobrados, abra o braco de cima acompanhando com o olhar.' },
  { id: 'mob_ombro', name: 'Circulo de ombro na parede', category: 'mobilidade', minutes: 2, howTo: 'Costas na parede, deslize os bracos para cima e para baixo mantendo contato.' },
  { id: 'mob_tornozelo', name: 'Avanco de joelho na parede', category: 'mobilidade', minutes: 2, howTo: 'Pe a um palmo da parede, leve o joelho a frente sem tirar o calcanhar do chao.' },
  { id: 'mob_gato_camelo', name: 'Gato e camelo', category: 'mobilidade', minutes: 2, howTo: 'De quatro, alterne arredondar e estender a coluna no ritmo da respiracao.' },
  { id: 'mob_agachamento_profundo', name: 'Agachamento profundo sustentado', category: 'mobilidade', minutes: 2, howTo: 'Fique no fundo do agachamento e respire fundo, empurrando os joelhos com os cotovelos.' },

  // ---- Equilibrio ----
  { id: 'eq_unipodal', name: 'Apoio em um pe', category: 'equilibrio', minutes: 2, howTo: '30 segundos em cada pe. Se ficar facil, feche os olhos.' },
  { id: 'eq_relogio', name: 'Relogio com o pe', category: 'equilibrio', minutes: 2, howTo: 'Em um pe, toque o chao a frente, ao lado e atras com o outro pe.' },
  { id: 'eq_calcanhar_ponta', name: 'Caminhada calcanhar-ponta', category: 'equilibrio', minutes: 2, howTo: 'Ande em linha reta encostando o calcanhar na ponta do outro pe.' },
  { id: 'eq_airplane', name: 'Aviao unilateral', category: 'equilibrio', minutes: 2, howTo: 'Em um pe, incline o tronco a frente estendendo a perna de tras.' },

  // ---- Coordenacao ----
  { id: 'coord_cross_crawl', name: 'Cotovelo no joelho oposto', category: 'coordenacao', minutes: 2, howTo: 'Em pe, alterne tocando o cotovelo no joelho contrario em ritmo constante.' },
  { id: 'coord_skip', name: 'Skipping no lugar', category: 'coordenacao', minutes: 2, howTo: 'Eleve os joelhos alternadamente com o ritmo controlado, sem correr.' },
  { id: 'coord_escada', name: 'Escada imaginaria', category: 'coordenacao', minutes: 2, howTo: 'Dois passos dentro, dois fora, como uma escada de agilidade no chao.' },
  { id: 'coord_maos_alternadas', name: 'Padroes de mao alternados', category: 'coordenacao', minutes: 2, howTo: 'Uma mao bate na perna, a outra desliza. Troque a cada 10 repeticoes.' },
]


const EXTRA_DRILLS: Drill[] = [
  // ---- Reflexo e reacao ----
  { id: 'ref_bola_parede', name: 'Bola contra a parede', category: 'reflexo', minutes: 2, howTo: 'Jogue uma bolinha na parede e pegue. Alterne as maos.', needsObject: true },
  { id: 'ref_queda_regua', name: 'Pegar objeto em queda', category: 'reacao', minutes: 2, howTo: 'Solte um objeto leve com uma mao e pegue com a outra antes de cair.', needsObject: true },
  { id: 'ref_toque_alvo', name: 'Toque em alvos', category: 'reacao', minutes: 2, howTo: 'Marque 3 pontos na parede e toque na ordem que voce disser em voz alta.' },
  { id: 'ref_troca_mao', name: 'Troca rapida de mao', category: 'reflexo', minutes: 2, howTo: 'Passe um objeto de uma mao para a outra o mais rapido possivel sem derrubar.', needsObject: true },

  // ---- Propriocepcao ----
  { id: 'prop_olhos_fechados', name: 'Postura de olhos fechados', category: 'propriocepcao', minutes: 2, howTo: 'Em pe, olhos fechados, perceba o peso nos pes e corrija o balanco.' },
  { id: 'prop_toque_nariz', name: 'Toque no nariz', category: 'propriocepcao', minutes: 2, howTo: 'Olhos fechados, estenda o braco e toque a ponta do nariz. Alterne.' },
  { id: 'prop_transferencia', name: 'Transferencia de peso', category: 'propriocepcao', minutes: 2, howTo: 'Passe o peso de um pe para o outro devagar, percebendo cada apoio.' },

  // ---- Controle corporal ----
  { id: 'cc_bear_crawl', name: 'Deslocamento de urso', category: 'controle_corporal', minutes: 2, howTo: 'De quatro com joelhos a 2 dedos do chao, ande a frente e atras.' },
  { id: 'cc_levantar_sentar', name: 'Sentar e levantar do chao', category: 'controle_corporal', minutes: 2, howTo: 'Sente e levante do chao usando o minimo de apoios possivel.' },
  { id: 'cc_ponte', name: 'Ponte de gluteo com pausa', category: 'controle_corporal', minutes: 2, howTo: 'Suba o quadril, segure 3 segundos no topo e desca controlado.' },
  { id: 'cc_hollow', name: 'Hollow hold', category: 'controle_corporal', minutes: 2, howTo: 'Deitado, lombar colada no chao, bracos e pernas estendidos.' },

  // ---- Olho-mao e cognitivo-motor ----
  { id: 'om_malabar', name: 'Malabarismo com 2 objetos', category: 'olho_mao', minutes: 2, howTo: 'Alterne dois objetos leves no ar mantendo o ritmo.', needsObject: true },
  { id: 'om_quique', name: 'Quique alternado', category: 'olho_mao', minutes: 2, howTo: 'Quique uma bola no chao alternando as maos sem olhar diretamente.', needsObject: true },
  { id: 'cog_contagem', name: 'Movimento com contagem regressiva', category: 'cognitivo_motor', minutes: 2, howTo: 'Faca o skipping contando de 100 para tras de 7 em 7.' },
  { id: 'cog_nomes', name: 'Categoria em movimento', category: 'cognitivo_motor', minutes: 2, howTo: 'Enquanto se movimenta, cite palavras de uma categoria sem repetir.' },
  { id: 'cog_esquerda_direita', name: 'Comando invertido', category: 'cognitivo_motor', minutes: 2, howTo: 'Diga esquerda e mova a direita. Inverta os comandos propositalmente.' },
]

export const DRILLS: Drill[] = [...CORE_DRILLS, ...EXTRA_DRILLS]

export const DRILL_BY_ID: Record<string, Drill> = Object.fromEntries(DRILLS.map((d) => [d.id, d]))

export const MOTOR_CATEGORY_LABEL: Record<string, string> = {
  mobilidade: 'Mobilidade',
  equilibrio: 'Equilibrio',
  coordenacao: 'Coordenacao',
  reflexo: 'Reflexo',
  reacao: 'Reacao',
  propriocepcao: 'Propriocepcao',
  controle_corporal: 'Controle corporal',
  olho_mao: 'Olho-mao',
  cognitivo_motor: 'Cognitivo-motor',
}

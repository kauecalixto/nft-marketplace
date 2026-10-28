/**
 * Posts do "Diário da Cunhagem" (rota /aprenda). Conteúdo estático e educativo, em português, sem promessa
 * financeira e sem fluxo de carteira ou pagamento real. Datas e tempos de leitura são ilustrativos (como no Figma).
 * As imagens são as 4 originais do Figma em public/nfts/.
 */
export interface Post {
  slug: string
  title: string
  summary: string
  date: string
  read: number
  img: string
  body: string[]
}

export const POSTS: Post[] = [
  {
    slug: 'como-funciona-a-propriedade-de-nfts',
    title: 'Como funciona a propriedade de NFTs',
    summary: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    date: '12 de setembro',
    read: 6,
    img: '/nfts/chimpanze-blazer.jpg',
    body: [
      'Um NFT (token não fungível) é um registro digital único, guardado em uma blockchain, que aponta para uma obra ou item colecionável. "Não fungível" significa que cada token é distinto: dois NFTs não são intercambiáveis como duas notas de mesmo valor.',
      'Ser dono de um NFT quer dizer controlar aquele registro: o histórico de transferências fica público e pode ser conferido por qualquer pessoa. O arquivo da obra costuma ficar fora da blockchain, e o token guarda a referência a ele.',
      'Possuir o token não transfere, por si só, os direitos autorais da obra. Esses direitos dependem dos termos definidos pelo criador. Antes de colecionar, leia o que a edição inclui, como uso pessoal, exibição ou revenda.',
      'Para verificar um NFT, confira o criador, a edição (quantas unidades existem e quantas restam) e o histórico de transferências. Neste ambiente de demonstração tudo é simulado: não há blockchain, carteira ou pagamento reais.',
    ],
  },
  {
    slug: '10-artistas-digitais-para-acompanhar',
    title: '10 artistas digitais para acompanhar',
    summary: 'Conheça criadores que moldam a cultura digital.',
    date: '13 de setembro',
    read: 2,
    img: '/nfts/macaco-jaqueta.jpg',
    body: [
      'Em vez de uma lista fechada de nomes, este guia mostra como descobrir artistas digitais que valem o seu acompanhamento. A cena muda rápido e boas descobertas costumam vir da curiosidade, não de rankings.',
      'Comece pela página Criadores deste marketplace: ela reúne quem publicou obras, quantas edições existem e a faixa de preço de cada um. Abra uma obra e veja como o criador descreve o trabalho.',
      'Observe a consistência: um estilo reconhecível, publicações regulares e edições com tiragem clara indicam um trabalho cuidadoso. Prefira criadores que explicam o processo e os direitos de uso.',
      'Acompanhar é diferente de comprar. Salve obras como favoritas, compare com calma e só então decida. Colecionar deve ser sobre gostar da arte, e nenhum valor futuro é garantido.',
    ],
  },
  {
    slug: 'raridade-atributos-e-procedencia',
    title: 'Raridade, atributos e procedência',
    summary: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    date: '15 de setembro',
    read: 3,
    img: '/nfts/gorila-chapeu.jpg',
    body: [
      'Raridade descreve o quanto uma edição é escassa. Uma obra de edição única (1 de 1) é mais rara do que uma com mil unidades, mas escassez sozinha não torna uma obra melhor, só diferente.',
      'Atributos são características combinadas em uma coleção, como cor, fundo ou acessórios. Quanto menos unidades têm um atributo, mais raro ele é dentro daquela coleção.',
      'Procedência é a história da obra: quem a criou, quem a possuiu e quando foi transferida. Um histórico claro e verificável dá mais confiança do que uma obra sem origem conhecida.',
      'Por fim, veja os direitos e a utilidade: o que o criador permite fazer com a obra e se há algum benefício associado. Na página de detalhes você encontra a edição, a disponibilidade e o limite de compra por carteira.',
    ],
  },
  {
    slug: 'como-proteger-sua-carteira',
    title: 'Como proteger sua carteira',
    summary: 'Proteja sua carteira, seus ativos e sua identidade.',
    date: '15 de setembro',
    read: 2,
    img: '/nfts/orangotango-fone.jpg',
    body: [
      'Uma carteira digital é protegida por chaves. Quem tem acesso a elas controla o que está na carteira, então a regra principal é nunca compartilhá-las: nenhum serviço legítimo pede a sua frase de recuperação ou a sua chave privada.',
      'Desconfie de mensagens com urgência, promessas de prêmio ou links recebidos de desconhecidos. Antes de clicar, confira o endereço do site e acesse os serviços digitando o endereço você mesmo.',
      'Guarde a frase de recuperação offline, em local seguro, e não a fotografe nem a salve em nuvem ou aplicativos de mensagem. Ative a verificação em duas etapas nas contas associadas.',
      'Neste ambiente de demonstração, as carteiras e os pagamentos são simulados e não existem fundos reais. Use-o para praticar o fluxo e leve estes hábitos para qualquer serviço real que você usar.',
    ],
  },
]

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug)

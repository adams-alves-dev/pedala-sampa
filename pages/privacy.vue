<template>
  <main class="doc">
    <div class="doc__inner">
      <NuxtLink to="/" class="back-link">
        <PsIcon name="chevronRight" :size="15" class="flip" /> Voltar ao mapa
      </NuxtLink>

      <p class="ps-eyebrow legal-eyebrow">Privacidade</p>
      <h1 class="ps-h1">Política de Privacidade</h1>
      <p class="ps-lead legal-lead">
        O Pedala Sampa é um mapa colaborativo e gratuito que ajuda ciclistas a
        descobrir grupos de pedal em São Paulo. Esta política explica quais
        dados tratamos, com que finalidade e como você controla essas
        informações.
      </p>
      <p class="legal-updated">Última atualização: 18 de junho de 2026.</p>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">1. Quem trata seus dados</h2>
        <p class="ps-body">
          O tratamento é feito pela equipe responsável pelo Pedala Sampa, na
          condição de controladora dos dados. O contato para assuntos de
          privacidade está na seção <em>Seus direitos</em>, abaixo.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">2. Quais dados coletamos</h2>
        <p class="ps-body">
          Só tratamos o mínimo necessário para o site funcionar e para receber
          suas contribuições:
        </p>
        <ul class="legal-list">
          <li>
            <strong>Mensagens que você envia</strong> — textos de sugestões de
            grupo, correções e feedback, com os dados do grupo que você
            informar.
          </li>
          <li>
            <strong>E-mail (opcional)</strong> — apenas se você preencher, para
            que possamos responder ou avisar sobre a revisão da sua
            contribuição.
          </li>
          <li>
            <strong>Endereço IP</strong> — usado de forma transitória para
            limitar abuso/spam dos formulários. Não é gravado junto com a sua
            mensagem.
          </li>
          <li>
            <strong>Preferência de tema</strong> — guardada apenas no seu
            navegador (armazenamento local), não enviada a nós.
          </li>
        </ul>
        <p class="ps-body">
          Não pedimos cadastro nem perfis de redes sociais, e não usamos cookies
          de publicidade ou rastreamento.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">
          3. Para que usamos e base legal
        </h2>
        <p class="ps-body">
          Usamos os dados para manter o mapa atualizado pela comunidade, avaliar
          e publicar contribuições, responder a contatos e proteger o site
          contra abuso. As bases legais (LGPD, art. 7º) são o seu
          <strong>consentimento</strong> ao enviar um formulário e o
          <strong>legítimo interesse</strong> em manter o serviço seguro e
          funcional.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">4. Com quem compartilhamos</h2>
        <p class="ps-body">
          Não vendemos seus dados. Eles são processados por prestadores que
          viabilizam o site (operadores), cada um sob sua própria política:
        </p>
        <ul class="legal-list">
          <li>
            <strong>Hygraph</strong> — armazena as contribuições enviadas.
          </li>
          <li>
            <strong>Netlify</strong> — hospeda o site e executa os formulários.
          </li>
          <li>
            <strong>Cloudflare Turnstile</strong> — verificação anti-robô dos
            formulários.
          </li>
          <li>
            <strong>Discord</strong> — recebe um aviso interno à equipe quando
            chega uma contribuição.
          </li>
          <li>
            <strong>Google Fonts</strong> e o
            <strong>provedor do mapa</strong> — ao carregar fontes e os blocos
            do mapa, seu IP é enviado a esses serviços, como em qualquer site.
          </li>
        </ul>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">
          5. Por quanto tempo guardamos
        </h2>
        <p class="ps-body">
          Mantemos as contribuições enquanto forem úteis ao mapa colaborativo.
          Você pode pedir a exclusão dos seus dados a qualquer momento (veja
          abaixo). Registros de abuso/IP são efêmeros e descartados em seguida.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">6. Seus direitos</h2>
        <p class="ps-body">
          Conforme a LGPD, você pode confirmar a existência de tratamento,
          acessar, corrigir, anonimizar ou excluir seus dados, e revogar o
          consentimento. Para exercer esses direitos ou tirar dúvidas, fale com
          a gente pelo
          <NuxtLink to="/about">formulário de contato</NuxtLink> na página Sobre
          — é o nosso canal oficial para solicitações de privacidade.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="ps-h3 legal-section__title">7. Alterações</h2>
        <p class="ps-body">
          Podemos atualizar esta política para refletir mudanças no site ou na
          legislação. A data de revisão no topo indica a versão vigente.
        </p>
      </section>

      <p class="legal-footer">
        Veja também os <NuxtLink to="/terms">Termos de Uso</NuxtLink>.
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Política de Privacidade - Pedala Sampa',
  description:
    'Como o Pedala Sampa trata seus dados pessoais conforme a LGPD: o que coletamos, para quê e seus direitos.',
})
</script>

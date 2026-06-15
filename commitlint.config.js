export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // descrições em pt-BR podem começar com maiúscula/acento — não travar por caixa
    'subject-case': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}

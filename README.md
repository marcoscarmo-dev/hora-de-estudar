# Hora de Estudar

Aplicação que transforma materiais em PDF em guias de estudo com
resumos, conceitos importantes e perguntas de revisão.

Projeto desenvolvido por Marcos Vinicius de Jesus do Carmo,
estudante de Análise e Desenvolvimento de Sistemas na
FAMINAS — Muriaé, MG.

## Funcionalidades

- Seleção de PDF de até 10 MB.
- Identificação do tema e geração de resumo com Google Gemini.
- Perguntas de revisão com gabarito.
- Biblioteca de resumos com busca e exclusão.
- Download dos resumos em formato TXT.
- Interface adaptável a telas menores.

## Tecnologias

- HTML e CSS.
- JavaScript.
- Node.js e Express.
- Multer para receber arquivos.
- API do Google Gemini.
- localStorage para salvar os resumos no navegador.

## Como executar

É necessário ter Node.js instalado e uma chave da API do Gemini.

1. Baixe ou clone o repositório.
2. Abra um terminal na pasta do projeto.
3. Instale as dependências:

```bash
npm install
```

4. Copie o arquivo `.env.example` para um novo arquivo chamado `.env`.
5. Coloque sua chave no `.env`:

```env
GEMINI_API_KEY=sua_chave
```

6. Inicie o servidor:

```bash
node server.cjs
```

7. Abra no navegador:

```text
http://localhost:3000
```

Mantenha o servidor em execução enquanto usa a aplicação.

## Armazenamento e privacidade

Os resumos são guardados somente no navegador utilizado.
Limpar os dados do navegador apaga a biblioteca.

Os PDFs são recebidos na memória do servidor e enviados ao Google
Gemini para análise. A aplicação não salva os PDFs em disco.

O uso da API depende da disponibilidade do modelo e das cotas da
conta. Na faixa gratuita, o Google pode usar o conteúdo para melhorar
seus produtos. Evite enviar materiais confidenciais.

Nunca publique o arquivo `.env` com sua chave.

## Limitações

- Os resumos podem conter erros e devem ser conferidos no PDF original.
- PDFs ilegíveis, protegidos por senha ou muito extensos podem falhar.
- Não há login, banco de dados ou sincronização entre dispositivos.
- A versão atual foi preparada para execução local.
- A publicação do servidor na internet exige controles adicionais
  de acesso e de uso da API.

## Aprendizado

Projeto construído com apoio de IA durante meu aprendizado,
praticando integração entre interface e servidor, envio de arquivos,
consumo de API e armazenamento no navegador.

## Vínculo acadêmico

Projeto independente de estudante, sem vínculo oficial com a FAMINAS.
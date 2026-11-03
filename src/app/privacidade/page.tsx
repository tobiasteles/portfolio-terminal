import type { Metadata } from "next";
import { LegalShell, H } from "@/components/legal-shell";
import { ResetConsentButton } from "@/components/analytics-consent";
import { getProfile } from "@/db/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como este portfólio trata os dados pessoais de quem o visita, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
};

export default async function PrivacyPage() {
  const p = await getProfile();
  const contact = p.email ?? "o e-mail indicado na página inicial";

  return (
    <LegalShell command="type privacidade.txt">
      <h1 className="text-2xl font-bold text-term-fg">Política de Privacidade</h1>
      <p className="text-term-dim">Atualizada em 2 de novembro de 2026.</p>

      <p>
        Este site é o portfólio profissional de {p.name}, de {p.location ?? "Brasília, DF"}. Aqui explico,
        de forma direta, quais dados são coletados, para quê, e como você pode exercer seus direitos
        previstos na Lei Geral de Proteção de Dados (Lei 13.709/2018, a LGPD).
      </p>

      <H>1. Quem é o controlador</H>
      <p>
        {p.name}, pessoa física. Contato para qualquer assunto de privacidade:{" "}
        <a href={`mailto:${p.email ?? ""}`}>{contact}</a>.
      </p>

      <H>2. Dados que coletamos e por quê</H>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Formulário de contato</strong> (comando <code>contact</code>): nome, e-mail, assunto e
          mensagem. Uso apenas para responder você. Base legal: seu consentimento ao enviar a mensagem e
          procedimentos preliminares a um possível contrato (LGPD, art. 7º, I e V).
        </li>
        <li>
          <strong>Estatísticas de acesso (Vercel Web Analytics)</strong>: páginas visitadas, país,
          navegador e dispositivo, sem cookies e sem identificar você individualmente.
        </li>
        <li>
          <strong>Google Analytics</strong> (só se estiver ativo no site): usa cookies para medir
          audiência. Só é carregado se você clicar em &quot;aceitar&quot; no aviso de cookies. Base legal:
          consentimento (art. 7º, I).
        </li>
        <li>
          <strong>Registros técnicos</strong>: endereço IP e horário das tentativas de envio de mensagem
          e de login administrativo, guardados por até 24 horas para impedir abusos e spam. Base legal:
          legítimo interesse e segurança (art. 7º, IX).
        </li>
      </ul>

      <H>3. Cookies</H>
      <p>
        O site não usa cookies de publicidade. O único cookie essencial é o de sessão da área
        administrativa, que só existe para quem faz login. Os cookies do Google Analytics só são criados
        se você aceitar. Você pode mudar de ideia a qualquer momento:
      </p>
      <p>
        <ResetConsentButton />
      </p>

      <H>4. Com quem os dados são compartilhados</H>
      <p>
        Com os prestadores que fazem o site funcionar, na condição de operadores: Vercel (hospedagem e
        estatísticas), Neon (banco de dados), Resend (aviso de novas mensagens por e-mail), CallMeBot
        (aviso por WhatsApp) e, se você aceitar, Google (Analytics). Alguns deles ficam fora do Brasil, e
        a transferência internacional ocorre para a execução do serviço e com base nas garantias
        contratuais desses provedores. Não vendo nem cedo seus dados para terceiros.
      </p>

      <H>5. Por quanto tempo guardamos</H>
      <p>
        As mensagens do formulário ficam guardadas pelo tempo necessário para conversarmos e por até 12
        meses depois, quando então são apagadas, salvo se houver obrigação legal ou contrato em andamento.
      </p>

      <H>6. Seus direitos</H>
      <p>
        Você pode pedir confirmação de que tratamos seus dados, acesso, correção, anonimização, exclusão,
        portabilidade, informação sobre compartilhamento e a revogação do consentimento (LGPD, art. 18).
        Basta escrever para {contact}. Respondo em até 15 dias. Se achar necessário, também pode
        reclamar à Autoridade Nacional de Proteção de Dados (gov.br/anpd).
      </p>

      <H>7. Segurança</H>
      <p>
        O site usa HTTPS, cabeçalhos de segurança, validação dos formulários, proteção contra envio
        automatizado e área administrativa protegida por senha criptografada. Nenhum sistema é 100%
        seguro, mas trabalho para reduzir os riscos.
      </p>

      <H>8. Mudanças nesta política</H>
      <p>Se algo mudar, atualizo esta página e a data no topo.</p>
    </LegalShell>
  );
}

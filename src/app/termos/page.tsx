import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, H } from "@/components/legal-shell";
import { getProfile } from "@/db/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Regras de uso do portfólio e do formulário de contato.",
  alternates: { canonical: "/termos" },
};

export default async function TermsPage() {
  const p = await getProfile();

  return (
    <LegalShell command="type termos.txt">
      <h1 className="text-2xl font-bold text-term-fg">Termos de Uso</h1>
      <p className="text-term-dim">Atualizados em 2 de novembro de 2026.</p>

      <p>
        Ao usar este site você concorda com as regras abaixo. Se não concordar, é só não usar.
      </p>

      <H>1. O que é este site</H>
      <p>
        Um portfólio profissional de {p.name}, com informações sobre projetos, tecnologias e formas de
        contato. As informações são fornecidas para fins de apresentação e podem mudar sem aviso.
      </p>

      <H>2. Uso permitido</H>
      <p>
        Você pode navegar, baixar o currículo e entrar em contato. Não é permitido tentar invadir o site,
        sobrecarregá-lo com acessos automatizados, enviar spam pelo formulário, ou usar a área
        administrativa sem autorização.
      </p>

      <H>3. Propriedade intelectual</H>
      <p>
        O código-fonte, os textos, o design e as imagens do portfólio pertencem a {p.name}, salvo onde
        houver indicação de outra autoria. Projetos de terceiros exibidos aqui pertencem aos seus
        respectivos donos. Para reutilizar qualquer conteúdo, peça autorização.
      </p>

      <H>4. Links externos</H>
      <p>
        O site aponta para páginas de terceiros (GitHub, LinkedIn, projetos online). Não controlo esses
        sites e não sou responsável pelo conteúdo ou pela política de privacidade deles.
      </p>

      <H>5. Sem garantias</H>
      <p>
        O site é oferecido &quot;como está&quot;. Faço o possível para mantê-lo no ar e correto, mas não
        garanto disponibilidade ininterrupta nem ausência de erros.
      </p>

      <H>6. Privacidade</H>
      <p>
        O tratamento de dados pessoais está descrito na <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <H>7. Lei aplicável</H>
      <p>
        Estes termos seguem as leis brasileiras. Eventuais conflitos serão resolvidos no foro da comarca
        de Brasília, DF.
      </p>

      <H>8. Contato</H>
      <p>
        Dúvidas sobre estes termos: {p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : "use o comando contact na página inicial"}.
      </p>
    </LegalShell>
  );
}

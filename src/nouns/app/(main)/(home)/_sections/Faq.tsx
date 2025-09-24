import FaqAccordion from "@nouns/components/FaqAccordion";
import { LinkExternal } from "@nouns/components/ui/link";
import { ReactNode } from "react";

const NOUNDERS: { name: string; href: string }[] = [
  { name: "@cryptoseneca", href: "https://x.com/cryptoseneca" },
  { name: "@gremplin", href: "https://x.com/gremplin" },
  { name: "@punk4156", href: "https://x.com/punk4156" },
  { name: "@eboyarts", href: "https://x.com/eboyarts" },
  { name: "@punk4464", href: "https://x.com/punk4464" },
  { name: "@solimander", href: "https://x.com/_solimander_" },
  { name: "@dhof", href: "https://x.com/dhof" },
  { name: "@devcarrot", href: "https://x.com/carrot_init" },
  { name: "@TimpersHD", href: "https://x.com/TimpersHD" },
  { name: "@lastpunk9999", href: "https://x.com/lastpunk9999" },
];

const QUESTIONS_AND_ANSWERS: { question: string; answer: ReactNode }[] = [
  {
    question: "What is a Noun?",
    answer: (
      <>
        <p>
          A Noun is a one-of-a-kind 32x32 pixel art character created daily as
          part of the Nouns project. Each Noun is randomly generated with
          traits:
        </p>
        <ul>
          <li>backgrounds</li>
          <li>heads</li>
          <li>glasses</li>
          <li>body</li>
          <li>accessory</li>
        </ul>
        <p>
          Each Noun is stored on the Ethereum blockchain. This makes the artwork
          permanent forever. Beyond the art, owning a Noun gives you membership
          in Nouns DAO, a community that manages a shared treasury to fund
          creative and impactful projects.
        </p>
      </>
    ),
  },
  {
    question: "What is Nouns DAO?",
    answer: (
      <>
        <p>
          Nouns is a community-driven project that creates and funds creative
          ideas and public initiatives. Each day, a unique pixel art character
          called a "Noun" is generated and sold through an auction. The funds
          raised go into a shared community treasury, managed collectively by
          Noun holders. Owning a Noun gives you a vote in deciding how the
          treasury is used.
        </p>
        <p>
          Since 2021, Nouns has supported hundreds of impactful projects across
          arts, education, the environment, sports, and more. These include
          funding schools, providing artist grants, supporting clean water
          initiatives, creating public goods like open-source software, backing
          charity events, empowering underrepresented communities, producing
          educational resources, and sponsoring innovative cultural and
          environmental projects. Nouns is committed to making a positive impact
          on the world.
        </p>
      </>
    ),
  },
  {
    question: "How do daily auctions work?",
    answer: (
      <>
        <p>
          Every day, a new Noun is created and auctioned off. The auction lasts
          24 hours, and the highest bidder at the end wins the Noun. Once the
          auction is settled, the proceeds are sent directly to the Nouns
          community treasury, and the next auction begins automatically. This
          cycle continues indefinitely, creating a new Noun every day. Anyone
          can participate in the auctions, and the funds raised are used to
          support creative and impactful projects decided by Noun holders.
        </p>
      </>
    ),
  },
  {
    question: "Who can own a Noun, and what does it mean?",
    answer: (
      <>
        <p>
          Anyone can own a Noun by winning a daily auction, purchasing one from
          an existing owner or redeeming 1,000,000 $NOUNS tokens. Owning a Noun
          gives you membership in Nouns DAO, a community where one Noun equals
          one vote. This allows you to participate in decisions about how the
          community treasury is used to fund creative and impactful projects.
        </p>
      </>
    ),
  },
  {
    question: "Are Nouns free to use?",
    answer: (
      <>
        <p>
          Yes, Nouns are completely free to use. Their artwork is in the public
          domain, meaning anyone can use, modify, or build upon Nouns without
          any restrictions or licenses. This openness encourages creativity and
          allows people to integrate Nouns into their own projects or ideas.
        </p>
      </>
    ),
  },
  {
    question: "What kinds of projects does Nouns fund?",
    answer: (
      <>
        <p>
          Nouns funds creative projects that benefit the public and support
          subcultures. These include:
        </p>
        <ul>
          <li>
            <b>Art</b>: Public art, artist grants, and creative projects.
          </li>
          <li>
            <b>Education</b>: Schools, learning tools, and resources.
          </li>
          <li>
            <b>Environment</b>: Clean water and sustainability efforts.
          </li>
          <li>
            <b>Sports</b>: Community events and programs.
          </li>
          <li>
            <b>Technology</b>: Open-source tools and blockchain improvements.
          </li>
          <li>
            <b>Charity</b>: Supporting underrepresented communities and social
            causes.
          </li>
          <li>and may more...</li>
        </ul>
        <p>
          By backing subcultures, Nouns encourages diversity, creativity, and
          innovation, helping unique ideas thrive.
        </p>
      </>
    ),
  },
  {
    question: "Who created Nouns?",
    answer: (
      <>
        <p>
          The Nounders are the creators of the Nouns project. To reward their
          work in building and maintaining the ecosystem, every 10th Noun for
          the first five years (e.g., Noun IDs #0, #10, #20, and so on) is
          automatically sent to the Nounders' wallet. This ensures they have a
          vested interest in the project's success while 100% of auction
          proceeds go directly to the Nouns DAO treasury.
        </p>
        <div>
          The Nounders include:
          <ul>
            {NOUNDERS.map(({ name, href }, i) => (
              <li key={i}>
                <LinkExternal
                  href={href}
                  className="underline hover:text-semantic-accent hover:brightness-100"
                >
                  {name}
                </LinkExternal>
              </li>
            ))}
          </ul>
        </div>
        <p>
          Importantly, these distributions don't disrupt the daily 24-hour
          auction cycle. Nouns sent to the Nounders' wallet are separate from
          the auction process, and auctions continue seamlessly with the next
          available Noun ID.
        </p>
      </>
    ),
  },
  {
    question: "What are $NOUNS tokens?",
    answer: (
      <>
        <p>
          $NOUNS tokens represent fractional ownership of a Noun NFT. Any Noun
          can be converted into 1,000,000 $NOUNS tokens, and those tokens can be
          redeemed to claim a Noun held in the $NOUNS token contract. This
          system allows people to collectively own or trade fractional shares of
          a Noun, making ownership more accessible and flexible.
        </p>
      </>
    ),
  },
];

export default function Faq() {
  return (
    <section
      className="flex w-full flex-col items-center justify-center gap-16 px-6 md:px-10"
      id="faq"
    >
      <div className="heading-1">Questions? Answers.</div>
      <FaqAccordion items={QUESTIONS_AND_ANSWERS} />
    </section>
  );
}

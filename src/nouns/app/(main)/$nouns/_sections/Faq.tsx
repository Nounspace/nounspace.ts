import FaqAccordion from "@nouns/components/FaqAccordion";
import { ComponentProps, ComponentType } from "react";

const QUESTIONS_AND_ANSWERS: ComponentProps<typeof FaqAccordion>["items"] = [
  {
    question: "What is $NOUNS?",
    answer: (
      <p>
        $NOUNS are ERC-20 tokens minted when a Noun NFT is deposited into the
        $NOUNS contract. Each deposit creates 1,000,000 $NOUNS tokens. These
        tokens are fractional shares of the Noun NFT, allowing you to trade,
        collect, or redeem them for a full Noun whenever you're ready.
      </p>
    ),
  },
  {
    question: "How are $NOUNS backed?",
    answer: (
      <p>
        $NOUNS are backed by the Noun NFTs held in the $NOUNS contract. Every
        $NOUN is collateralized by these Nouns, giving them real value and
        making them redeemable for any Noun NFT in the contract.
      </p>
    ),
  },
  {
    question: "What's the total supply of $NOUNS?",
    answer: (
      <p>
        The supply of $NOUNS grows as more Noun NFTs are deposited into the
        $NOUNS contract. Each deposited Noun mints exactly 1,000,000 $NOUNS
        tokens, tied to the value of the underlying Noun.
      </p>
    ),
  },
  {
    question: "How can I redeem $NOUNS for a Noun?",
    answer: (
      <p>
        To redeem a Noun NFT, collect 1,000,000 $NOUNS tokens. Once you have
        enough, you can exchange them for any Noun NFT currently held in the
        $NOUNS contract. This process is straightforward and can be done
        directly through the contract interface.
      </p>
    ),
  },
  {
    question: "Where can I buy $NOUNS?",
    answer: (
      <p>
        You can buy $NOUNS on decentralized exchanges (DEXs) like Uniswap.
        Simply connect your wallet, search for the $NOUNS token, and start
        trading. Ensure you're using the correct token contract address for
        security.
      </p>
    ),
  },
  {
    question: "Why $NOUNS?",
    answer: (
      <p>
        $NOUNS offer a flexible and affordable way to participate in the Nouns
        ecosystem. Instead of buying a full Noun NFT, which can be expensive,
        you can start small by collecting $NOUNS. They also provide liquidity,
        so you can trade or hold them based on your goals.
      </p>
    ),
  },
  {
    question: "Are $NOUNS just another memecoin?",
    answer: (
      <p>
        No. $NOUNS have unique utility as they are directly tied to Noun NFTs.
        They combine the flexibility of ERC-20 tokens with the value of Noun
        NFTs, offering a fractional, redeemable way to participate in the Nouns
        ecosystem.
      </p>
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

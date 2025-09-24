import { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@nouns/components/ui/accordion";

interface FaqProps {
  items: { question: string; answer: ReactNode }[];
}

export default function FaqAccordion({ items }: FaqProps) {
  return (
    <Accordion type="single" collapsible className="w-full max-w-[720px]">
      {items.map(({ question, answer }, i) => (
        <AccordionItem value={question} key={i} className="first:border-t-0">
          <AccordionTrigger className="px-0 text-start hover:bg-transparent hover:underline">
            <h3 className="heading-4">{question}</h3>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-[1em] [&>ul]:list-inside [&>ul]:list-disc [&>ul]:pl-2 [&_*_ul]:list-inside [&_*_ul]:list-disc [&_*_ul]:pl-2">
            {answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

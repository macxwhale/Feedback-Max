
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "What is Pulsify?",
    answer: "Pulsify is an AI-powered customer feedback platform that helps businesses collect, analyze, and act on customer insights to drive growth. We unify feedback from various channels and provide actionable analytics."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on our Professional plan. No credit card is required to get started. You can explore all the features and see how Pulsify can benefit your business."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We offer email support on the Starter plan and priority email and chat support on the Professional plan. Enterprise customers receive a dedicated success manager and custom support SLAs."
  },
  {
    question: "Can I integrate Pulsify with other tools?",
    answer: "Our Professional and Enterprise plans also include API access for custom integrations."
  },
  {
    question: "How is my data secured?",
    answer: "We take data security very seriously. Our platform is SOC 2 compliant, and all data is encrypted end-to-end. We follow industry best practices to ensure your data is safe and private."
  },
  {
    question: "Can I customize the feedback forms?",
    answer: "Yes! You can customize the look and feel of your feedback forms to match your brand, including colors, logos, and custom domains (on supported plans)."
  }
];

export const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-24 bg-white dark:bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-warm-gray-900 dark:text-dark-warm-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-warm-gray-600 dark:text-dark-warm-600">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-b border-warm-gray-200 dark:border-dark-warm-200">
                <AccordionTrigger className="text-left text-lg font-medium text-warm-gray-900 dark:text-dark-warm-900 hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-warm-gray-600 dark:text-dark-warm-600 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

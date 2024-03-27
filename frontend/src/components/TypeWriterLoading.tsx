import { useEffect, useState } from "react";

const Typewriter = ({ text, delay }: { text: string; delay: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]); // Depend on currentIndex, delay, and text for re-render

  return <span>{currentText}</span>;
};

const TypewriterLoading = () => (
  <div className="govuk-inset-text">
    <Typewriter
      text="Thinking about it 🤔... Writing some SQL 💻... Running some queries 🏃‍♂️... Crafting an answer ✍️..."
      delay={20}
    />
  </div>
);

export default TypewriterLoading;

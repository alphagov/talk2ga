import { useEffect, useState } from 'react';

const Typewriter = ({ text, delay }: { text: string; delay: number }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      const timeout2 = setTimeout(() => {
        setCurrentText(text[0]);
        setCurrentIndex(1);
      }, 500);
      return () => clearTimeout(timeout2);
    }
  }, [currentIndex, delay, text]);

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

import { useEffect } from "react";

const addBodyClass = className => document.body.classList.add(className);
const removeBodyClass = className => document.body.classList.remove(className);

export default function useBodyClass(className) {
  useEffect(() => {
    className instanceof Array ? className.map(addBodyClass) : addBodyClass(className);

    return () => {
      className instanceof Array ? className.map(removeBodyClass) : removeBodyClass(className);
    };
  }, [className]);
}

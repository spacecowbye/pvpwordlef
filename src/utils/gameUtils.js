import { WORD_LIST } from "./wordList.js";
export const getRandomWordforWordle = () => {

  const n = WORD_LIST.length ;
  const index = Math.floor(Math.random()*n);
  return WORD_LIST[index];

}

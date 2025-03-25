import { gsap } from "gsap";

function logoStartPage() {
  gsap.to("#logoStartPage", {
    yoyo: true,
    repeat: -1,
    y: -10,
    duration: 2,
    ease: "sine.inOut",
    textShadow: `
    0 0 10px rgb(0, 128, 0),
    0 0 20px rgb(205, 205, 205),
    0 0 30px rgb(205, 205, 205),
    0 0 40px rgb(0, 128, 0),
    0 0 70px rgb(0, 128, 0),
    0 0 80px rgb(0, 128, 0),
    0 0 100px rgb(0, 128, 0),
    0 0 150px rgb(0, 128, 0)
    `,
  });
}

logoStartPage();

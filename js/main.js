/* Только интерфейс: прокрутка управляет иллюстрацией. Данные не собираются. */
(() => {
  "use strict";

  const journey = document.querySelector("#journey");
  if (!journey) return;

  const scene = document.querySelector("#scene");
  const landscape = document.querySelector("#landscape");
  const terrain = document.querySelector("#terrain");
  const path = document.querySelector("#climb-path");
  const hiker = document.querySelector("#hiker");
  const body = document.querySelector("#hiker-body");
  const leftLeg = document.querySelector("#leg-left");
  const rightLeg = document.querySelector("#leg-right");
  const lowlands = document.querySelector("#lowlands");
  const clouds = document.querySelector("#clouds");
  const sky = document.querySelector(".sky-high");
  const flag = document.querySelector("#summit-flag");
  const flagLink = document.querySelector(".flag-link");
  const meter = document.querySelector("#progress-fill");
  const number = document.querySelector("#scene-number");
  const label = document.querySelector("#scene-label");
  const chapters = [...journey.querySelectorAll("[data-stage]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 760px)");
  const pathLength = path.getTotalLength();
  let frame = 0;
  let journeyTop = 0;
  let distance = 1;
  let chapterOffsets = [];

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smooth = (start, end, value) => {
    const t = clamp((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };

  function measure() {
    journeyTop = journey.getBoundingClientRect().top + window.scrollY;
    distance = Math.max(1, journey.offsetHeight - scene.clientHeight);
    chapterOffsets = chapters.map(chapter => chapter.offsetTop);
    const sceneWidth = scene.clientWidth / scene.clientHeight * 1000;
    const center = mobile.matches ? 910 : 800;
    landscape.setAttribute("viewBox", `${center - sceneWidth / 2} 0 ${sceneWidth} 1000`);
    schedule();
  }

  function paint() {
    frame = 0;
    const progress = clamp((window.scrollY - journeyTop) / distance);
    const staticScene = reducedMotion.matches;
    const portraitScene = mobile.matches && scene.clientHeight >= 650;
    // Последние 8% пути отведены установке флага.
    const climb = staticScene ? 1 : smooth(0, .92, progress);
    const point = path.getPointAtLength(pathLength * climb);
    const step = staticScene || progress >= .92 ? 0 : Math.sin(climb * Math.PI * 100);
    const size = mobile.matches ? 1.04 : 1;
    // На узком экране камера держит туриста над областью чтения.
    const cameraY = portraitScene && !staticScene
      ? Math.min(0, 200 - point.y) * smooth(0, .12, progress)
      : 0;
    terrain.setAttribute("transform", `translate(0 ${cameraY.toFixed(2)})`);
    hiker.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) scale(${size})`);
    body.setAttribute("transform", `translate(0 ${(-Math.abs(step) * 1.8).toFixed(2)}) rotate(${(step * 2).toFixed(2)} 0 -25)`);
    leftLeg.setAttribute("transform", `rotate(${(step * 13).toFixed(2)} -9 -20)`);
    rightLeg.setAttribute("transform", `rotate(${(-step * 13).toFixed(2)} 9 -20)`);

    const altitude = staticScene ? 1 : smooth(.38, .57, progress);
    lowlands.style.opacity = staticScene ? 0 : ((.35 + .65 * smooth(0, .1, progress)) * (1 - altitude)).toFixed(3);
    lowlands.setAttribute("transform", `translate(0 ${(altitude * 80 - cameraY).toFixed(1)})`);
    sky.style.opacity = altitude.toFixed(3);
    clouds.style.opacity = altitude.toFixed(3);
    clouds.setAttribute("transform", `translate(${staticScene ? 0 : ((progress - .5) * -35).toFixed(1)} ${(-cameraY).toFixed(1)})`);
    const planted = staticScene ? Number(progress >= .91) : smooth(.91, .975, progress);
    flag.style.opacity = planted.toFixed(3);
    flag.setAttribute("transform", `translate(28 ${((1 - planted) * -16).toFixed(1)})`);
    flagLink.style.pointerEvents = planted > .9 ? "auto" : "none";
    flagLink.tabIndex = planted > .9 ? 0 : -1;
    flag.setAttribute("aria-hidden", planted > .9 ? "false" : "true");
    meter.style.transform = `scaleY(${progress})`;

    const readingPosition = window.scrollY - journeyTop + scene.clientHeight * .45;
    let current = 0;
    chapterOffsets.forEach((offset, index) => {
      if (readingPosition >= offset) current = index;
    });
    number.textContent = `${String(current + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
    label.textContent = chapters[current].dataset.stage;
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(paint);
  }

  // Без JS карточки остаются видимыми, а финальная ссылка доступна.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle("is-visible", entry.isIntersecting));
    }, { threshold: .08, rootMargin: "30px 0px" });
    journey.querySelectorAll(".reveal").forEach(card => observer.observe(card));
    document.documentElement.classList.add("js-ready");
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("pageshow", measure);
  reducedMotion.addEventListener("change", measure);
  mobile.addEventListener("change", measure);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(journey);
  document.fonts?.ready.then(measure);
  measure();
})();

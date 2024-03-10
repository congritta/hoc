import vars from "./vars.js";

export function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

export function getRandomHex(length = 1) {
  if(length < 1) throw new Error("\"length\" parameter must be greater than 1");

  return [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function getRandomDate(min, max) {
  const date = new Date(getRandomNumber(min.getTime(), max.getTime()));

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

export function generateAnEvent() {
  return {
    id: getRandomHex(8),
    title: getRandomHex(12),
    timestamp: getRandomDate(new Date("2008-01-01"), new Date()),
    priority: getRandomNumber(0, 9)
  };
}

export function getCSSPropsByEvent(event) {

  const eventCss = vars.timelineEventCircleVars[event.priority_score];
  const eventDate = new Date(event.event_date);

  return {
    width: `${eventCss.size}px`,
    height: `${eventCss.size}px`,
    top: `${getRandomNumber(eventCss.size, (window.innerHeight - eventCss.size))}px`,
    left: `${((eventDate - window.minDate) / (window.maxDate - window.minDate)) * 100}%`,
    "box-shadow": `inset 0 0 0 ${eventCss.size / 2}px ${eventCss.color}`,
    opacity: `${(10 - event.priority + 1) / 10}`,
    "border-radius": `${eventCss.size / 2}px`
  };
}

export function getLayerCSSPropsByZoom(zoomLevel = 1, priority = 1, mouseX = 0, mouseY = 0) {

  if(zoomLevel < 0) return {};

  const weight = (10 - priority);

  const x = (mouseX - window.innerWidth / 2) / weight / 2;
  const y = (mouseY - window.innerHeight / 2) / weight / 2;

  if(zoomLevel * (10 - priority) > 3000 / (10 - priority)) {
    return {
      opacity: "0",
      visibility: "hidden"
    };
  }

  return {
    display: "block",
    transform: `translateZ(${zoomLevel * (10 - priority)}px) translateX(${-x * weight}px) translateY(${-y * weight}px)`,
    "z-index": `${10 - priority}`,
    opacity: 1,
    visibility: "visible"
  };
}

export function getLayerCSSPropsByMouseMove(zoomLevel, priority, mouseX, mouseY) {

  if(zoomLevel < 0) return {};

  const weight = (10 - priority);

  const x = (mouseX - window.innerWidth / 2) / weight / 2;
  const y = (mouseY - window.innerHeight / 2) / weight / 2;

  return {
    transform: `translateZ(${zoomLevel * (10 - priority)}px) translateX(${-x * weight}px) translateY(${-y * weight}px)`,
  };
}

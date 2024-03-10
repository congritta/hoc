import {getCSSPropsByEvent, getLayerCSSPropsByMouseMove, getLayerCSSPropsByZoom} from "./misc.js";

/* Vars */
window.zoomLevel = 5;
window.minDate = null;
window.maxDate = null;

// /* Generate events */
// const events = [...Array(900)].map(() => generateAnEvent())

/* Build initial DOM function */
function buildDOM(events) {

  /* Build initial DOM */
  const timelineWrapperEl = document.createElement("div");
  timelineWrapperEl.setAttribute("id", "timelineWrapper");

  const timelineLayers = [...Array(10)].map(() => document.createElement("div"));

  /* Render circles */
  events.forEach((event) => {

    const eventEl = document.createElement("div");

    let parentZIndex = null;

    eventEl.onmouseover = () => {
      eventEl.classList.add("isRevealed");

      parentZIndex = 10 - +(eventEl.parentNode.getAttribute("data-priority"));
      eventEl.parentNode.style["z-index"] = 10;
    };

    eventEl.onmouseout = () => {
      eventEl.classList.remove("isRevealed");
      eventEl.parentNode.style["z-index"] = parentZIndex;
    };

    eventEl.onmousewheel = (event) => {
      event.stopPropagation();
    };

    eventEl.innerHTML = `
      <div class="eventContents">
        <div class="title">${event.title}</div>
        <div class="timestamp">${(new Date(event.event_date)).toLocaleDateString()}</div>
        
        <div class="contents">
          ${event.imgUrl ? (
      `<img src="${event.imgUrl}" alt="${event.title}">`
    ) : ``}
          
          <p>${event.description}</p>
        </div>
      </div>
    `;

    const cssProps = getCSSPropsByEvent(event);
    for(const [prop, value] of Object.entries(cssProps)) {
      eventEl.style[prop] = value;
    }

    timelineLayers[event.priority_score].appendChild(eventEl);
  });

  /* Render layers */
  timelineLayers.forEach((el, i) => {

    el.setAttribute("data-priority", i);

    const cssProps = getLayerCSSPropsByZoom(window.zoomLevel, i);

    for(const [prop, value] of Object.entries(cssProps)) {
      el.style[prop] = value;
    }

    timelineWrapperEl.appendChild(el);
  });

  /* Render timeline */
  document.body.appendChild(timelineWrapperEl);

  /* Zoom function */
  function zoom(mouseX, mouseY) {
    timelineLayers.forEach((el, i) => {

      const cssProps = getLayerCSSPropsByZoom(window.zoomLevel, i, mouseX, mouseY);

      for(const [prop, value] of Object.entries(cssProps)) {
        el.style[prop] = value;
      }
    });
  }

  function move(mouseX, mouseY) {
    timelineLayers.forEach((el, i) => {

      const cssProps = getLayerCSSPropsByMouseMove(window.zoomLevel, i, mouseX, mouseY);

      for(const [prop, value] of Object.entries(cssProps)) {
        el.style[prop] = value;
      }
    });
  }

  window.addEventListener("mousewheel", (event) => {

    if((window.zoomLevel - event.deltaY / 20) > 0) {
      window.zoomLevel -= event.deltaY / 20;
    }

    requestAnimationFrame(() => {
      zoom(event.pageX, event.pageY);
    });
  });

  window.addEventListener("mousemove", (event) => {
    requestAnimationFrame(() => {
      move(event.pageX, event.pageY);
    });
  });
}

/* Load events from API */
fetch("/events.json")
  .then((res) => res.json())
  .then((events) => {
    window.minDate = new Date(events[0].event_date);
    window.maxDate = new Date(events[events.length - 1].event_date);
    buildDOM(events);
  })
  .catch((error) => {
    console.error(error);
    alert(`Возникла ошибка: ${error instanceof Error ? error.message : error}`);
  });

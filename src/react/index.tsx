export default {
  createElement: (
    tagName: string,
    attributes: { [key: string]: string },
    ...children: HTMLDivElement[]
  ) => {
    const dom = document.createElement(tagName);
    for (let key in attributes) {
      if ("__source" === key) {
        continue;
      }
      dom.setAttribute(key, attributes[key]);
    }
    if (children.length > 0) {
      dom.append(...children);
    }
    // console.log(children);
    return dom;
  }
};

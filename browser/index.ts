import morphdom from "morphdom";

interface ActionResponse {
  component: string;
  html: string;
}

document.addEventListener("submit", (event) => {
  const form = event.target;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  if (!form.matches("[x-server-action]")) {
    return;
  }

  event.preventDefault();

  executeAction(form).catch(console.error);
});

const executeAction = async (form: HTMLFormElement): Promise<void> => {
  const component = form.closest<HTMLElement>("[x-component]");
  if (!component) {
    throw new Error("Server action must belong to a component.");
  }

  const data = new FormData(form);

  const response = await fetch(form.action, {
    method: form.method,
    body: data,
  });

  const result = (await response.json()) as ActionResponse;

  morphComponent(result.component, result.html);
};

const morphComponent = (componentId: string, html: string): void => {
  const selector = `[x-component="${componentId}"]`;
  const current = document.querySelector<HTMLElement>(selector);
  if (!current) {
    throw new Error(`Component "${componentId}" was not found.`);
  }

  morphdom(current, html);
};

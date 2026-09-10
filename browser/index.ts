import morphdom from "morphdom";

interface ActionResponse {
  target?: string;
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

  const submitter = event instanceof SubmitEvent ? event.submitter : null;
  executeAction(form, submitter).catch(console.error);
});

const executeAction = async (
  form: HTMLFormElement,
  submitter: HTMLElement | null,
): Promise<void> => {
  const data = new FormData(form, submitter);
  const body = new URLSearchParams();

  data.forEach((value, key) => {
    if (typeof value === "string") {
      body.append(key, value);
    }
  });

  const response = await fetch(form.action, {
    method: form.method.toUpperCase(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Server action failed with status ${response.status}.`);
  }

  const result = (await response.json()) as ActionResponse;

  const element = getElement(result.target ?? form);
  morphdom(element, result.html);
};

const getElement = (target: string | HTMLElement): HTMLElement => {
  if (target instanceof HTMLElement) {
    return target;
  }

  const element = document.getElementById(target);
  if (!element) {
    throw new Error(`Target ${target} was not found.`);
  }
  return element;
};

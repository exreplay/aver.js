export const composeComponentOptions = component => {
  let asyncData;

  if (component.asyncData) asyncData = component.asyncData;
  else if (component.options && component.options.asyncData) {
    asyncData = component.options.asyncData;
  }

  return { asyncData };
};

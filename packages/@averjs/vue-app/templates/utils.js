export const composeComponentOptions = component => {
  let asyncData;

  if (component.asyncData) asyncData = component.asyncData;
  else if (component.options && component.options.asyncData) {
    asyncData = component.options.asyncData;
  }

  return { asyncData };
};

export const applyAsyncData = (Component, asyncData) => {
  if (!asyncData && Component.options.__hasAsyncData) return;

  const ComponentData = Component.options.data || function() { return {}; };

  Component.options.data = function() {
    const data = ComponentData.call(this, this);

    return { ...data, ...asyncData };
  };

  Component.options.__hasAsyncData = true;
  
  if (Component._Ctor && Component._Ctor.options) {
    Component._Ctor.options.data = Component.options.data;
  }
};

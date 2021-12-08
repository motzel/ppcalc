import App from './components/App.svelte';
import ErrorComponent from './components/Error.svelte'

try {
  const app = new App({target: document.body});
} catch (error) {
  console.error(error);

  if (error instanceof DOMException && error.toString() === 'InvalidStateError: A mutation operation was attempted on a database that did not allow mutations.') error = new Error('Firefox in private mode does not support the database. Please run the site in normal mode.')

  app = new ErrorComponent({
    target: document.body, props: {error, withTrace: true},
  });
}

export default app;
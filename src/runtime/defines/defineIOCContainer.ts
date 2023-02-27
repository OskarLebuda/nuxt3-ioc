import { Container } from '../ioc/Container';
import { $StateSerializer, StateSerializer } from '../service/StateSerializer';

export const defineIOCContainer = (): Container => {
  const container = new Container();

  // always bind container itselfs
  container.bindInstance(Container, container);

  // bind base services
  container.bind($StateSerializer, StateSerializer);

  return container;
};
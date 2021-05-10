import newStatusCodeOnlyHttpHandler from "./newStatusCodeOnlyHttpHandler";

const statusCodeOnlyHandlers = {
  $200: newStatusCodeOnlyHttpHandler(200),
  $404: newStatusCodeOnlyHttpHandler(404),
  $500: newStatusCodeOnlyHttpHandler(500),
};

export default statusCodeOnlyHandlers;

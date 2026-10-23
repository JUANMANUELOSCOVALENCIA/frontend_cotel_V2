// src/shared/components/pageBar.js
// La barra superior (Topbar) muestra el título de la página según el menú, su descripción y sus
// acciones. Las páginas las declaran con <PageHeader subtitle actions />: la descripción se envía
// por este contexto y las acciones se dibujan (portal) en el espacio que deja la barra superior.
import { createContext, useContext } from 'react';

export const PageBarContext = createContext(null);
export const usePageBar = () => useContext(PageBarContext);

import { FC, useEffect, useRef } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";


const ScrollToTop: FC<RouteComponentProps> = ({ location }) => {
  const prevLocation = useRef(location);

  useEffect(() => {
    if (location.pathname !== prevLocation.current.pathname) {
      window.scrollTo(0, 0);
    }

    prevLocation.current = location;
  }, [location]);

  return null;
};

export default withRouter(ScrollToTop);

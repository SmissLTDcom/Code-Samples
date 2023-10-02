import Social from "../../../components/Social";
import config from "../../../config/config.json";
import menu from "../../../config/menu.json";
import social from "../../../config/social.json";
import { markdownify } from "../../../utils/textConverter";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const { copyright, footer_content } = config.footer;
  const { footer } = menu;
  return (
    <footer className="section bg-theme-light pb-0">
      <div className="container">
        <div className="row">
          {footer.map((column) => {
            return (
              <div className="mb-12 sm:col-6 lg:col-3" key={column.name}>
                {markdownify(column.name, "h2", "h4")}
                <ul className="mt-6">
                  {column.menu.map((item) => (
                    <li className="mb-1" key={item.text}>
                      <Link href={item.url} rel="">
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="md-12 sm:col-6 lg:col-3">
            <Link href="/">
              <Image
                src={config.site.logo}
                width={config.site.logo_width}
                height={config.site.logo_height}
              />
            </Link>
            {markdownify(footer_content, "p", "mt-3 mb-6")}
            <Social source={social} className="social-icons mb-8" />
          </div>
        </div>
        <div className="border-t border-border py-6">
          {markdownify(copyright, "p", "text-sm text-center")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
/* Copyright (C) 2016  IRIDE Monad <iride.monad@gmail.com>
 * License: GNU GPLv3 http://www.gnu.org/licenses/gpl-3.0.html */

import React from "react";
import { translate } from "@io-monad/chrome-util";
import Paragraph from "./paragraph";

export default class AboutSection extends React.Component {
  render() {
    return (
      <div className="about-section">
        <h2>{translate("aboutExtension")}</h2>
        <Paragraph text="aboutS1P1" />
        <Paragraph text="aboutS1P2" />
        <Paragraph text="aboutS1P3" />
      </div>
    );
  }
}

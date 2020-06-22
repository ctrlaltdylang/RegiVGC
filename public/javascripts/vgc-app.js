/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
// import typeAhead from './modules/typeAhead';
import makeMap from './modules/makeMap';
import gigantimax from './modules/gigantimax';

autocomplete($('#address'), $('#lat'), $('#lng'));

// typeAhead($('.search'));

makeMap($('#map'));

gigantimax($('#gigantimax0'));
gigantimax($('#gigantimax1'));
gigantimax($('#gigantimax2'));
gigantimax($('#gigantimax3'));
gigantimax($('#gigantimax4'));
gigantimax($('#gigantimax5'));

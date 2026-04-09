import { ALBERTA_CONFIG } from './alberta';
import { CANADA_67_CONFIG } from './canada-67';
import { BC_PNP_CONFIG } from './bc-pnp';
import { MANITOBA_CONFIG } from './manitoba';
import { NOVA_SCOTIA_CONFIG } from './nova-scotia';
import { SINP_CONFIG } from './sinp';
import { ONTARIO_CONFIG } from './ontario';
import { QUEBEC_CONFIG } from './quebec';
import { EXPRESS_ENTRY_CONFIG } from './express-entry';
import { CalculatorConfig } from '../shared/calculator-page';

export const CALCULATOR_CONFIGS: Record<string, CalculatorConfig> = {
    'express-entry': EXPRESS_ENTRY_CONFIG,
    'alberta': ALBERTA_CONFIG,
    'canada-67': CANADA_67_CONFIG,
    'bc': BC_PNP_CONFIG,
    'manitoba': MANITOBA_CONFIG,
    'nova-scotia': NOVA_SCOTIA_CONFIG,
    'saskatchewan': SINP_CONFIG,
    'ontario': ONTARIO_CONFIG,
    'quebec': QUEBEC_CONFIG,
};

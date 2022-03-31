import * as FlexPlugin from '@twilio/flex-plugin';
import * as dotenv from 'dotenv';
import Pay20Plugin from './Pay20Plugin';

dotenv.config();

FlexPlugin.loadPlugin(Pay20Plugin);

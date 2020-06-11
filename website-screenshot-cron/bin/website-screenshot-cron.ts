#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WebsiteScreenshotCronStack } from '../lib/website-screenshot-cron-stack';

const app = new cdk.App();
new WebsiteScreenshotCronStack(app, 'WebsiteScreenshotCronStack');

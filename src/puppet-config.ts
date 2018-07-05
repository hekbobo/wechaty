import {
  Constructor,
}                 from 'clone-class'
import npm        from 'npm-programmatic'
import pkgDir     from 'pkg-dir'

import {
  Puppet,
}                 from 'wechaty-puppet'

import {
  log,
}                 from './config'

export interface PuppetConfig {
  npm: string,
}

/**
 * Wechaty Official Puppet Plugins List
 */
const mock: PuppetConfig = {
  npm: 'wechaty-puppet-mock',
}

const wechat4u: PuppetConfig = {
  npm: 'wechaty-puppet-wechat4u',
}

const padchat: PuppetConfig = {
  npm: 'wechaty-puppet-padchat@^0.3.6',
}

export const PUPPET_DICT = {
  default: wechat4u,
  //////////////////////////
  mock,
  padchat,
  wechat4u,
  // puppeteer:  PuppetPuppeteer,
}

export type PuppetName = keyof typeof PUPPET_DICT

//   'android-pad'
// | 'android-phone'
// | 'cat-king'
// | 'hostie'
// | 'ios-app-phone'
// | 'ios-app-pad'
// | 'mock'
// | 'web'
// | 'win32'

export async function puppetResolver (puppet: PuppetName): Promise<typeof Puppet & Constructor<Puppet>> {
  log.verbose('PuppetConfig', 'puppetResolver(%s)', puppet)

  const config = PUPPET_DICT[puppet]
  if (!config) {
    throw new Error('no such puppet: ' + puppet)
  }

  // tslint:disable-next-line:variable-name
  let puppetModule

  try {
    puppetModule = await import(config.npm)
  } catch (e) {
    try {
      await installPuppet(config.npm)
      puppetModule = await import(config.npm)
    } catch (e) {
      log.error('PupptConfig', 'puppetResolver(%s) install fail: %s', puppet, e.message)
      throw e
    }
  }

  log.silly('PuppetConfig', 'puppetResolver(%s) import success.', puppet)

  return puppetModule.default as typeof Puppet & Constructor<typeof Puppet>
}

async function installPuppet (puppetNpm: string): Promise<void> {
  log.info('PuppetConfig', 'installPuppet(%s) installing ...', puppetNpm)
  await npm.install(
    puppetNpm,
    {
      cwd    : await pkgDir(__dirname),
      output : true,
      save   : false,
    },
  )
  log.info('PuppetConfig', 'installPuppet(%s) done', puppetNpm)
}

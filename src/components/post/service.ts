import {Page} from 'puppeteer';
import { HTTP400Error } from '../../utils/error/HTTP400Error';
import { getPage,authenticate } from '../puppeteer/service';
import { separator } from '../../commons/constants';
import { Post } from './Post';
import { permutaciones } from './combination';
import cron from 'node-cron';

const random = (min:number, max:number) : number => {
  return min + Math.random() * (max - min);
}

export const publicMessage = async ({url,users,quantity,unique}: Post): Promise<void> => {
  
  const messages = quantity == 1 ? users : permutaciones(users,quantity-1);

  if (!isInstagram(url)) throw new HTTP400Error("Ingresar una url de instagram");
  const isAuth = await authenticate();
  
  if(!isAuth) throw new HTTP400Error("Usuario y/o contraseña incorrecto");
  for (const message of messages) await commentPost(url,message,unique);

  cron.schedule(`31 */15 6 * * *`, async () :Promise<void> => {
    for (const message of messages) await commentPost(url,message,unique);
  });
  
};


const commentPost = async (url: string,message:string,unique:Boolean = true): Promise<void> => {
  
  if(unique){
    const messageSplit = message.split(separator);
    let uniqueMessage = [...new Set(messageSplit)]; 
    if(uniqueMessage.length < messageSplit.length) return;
  }
  const page = await getPage(url);
  const timeWaitComment = random(123,1231);
  const timeWait = random(5123,13324);
  const textTareaComment = 'textarea';

  await page.waitForSelector(textTareaComment);
  await page.type(textTareaComment, message,{ delay: timeWaitComment });
  
  await page.click('button[type="submit"]');
  await page.waitFor(timeWait);
};

const isInstagram = (url:string): boolean => {
    //TODO: Implementar
    return true;
};
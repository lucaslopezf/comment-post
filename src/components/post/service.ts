import { HTTP400Error,logger } from '../../utils';
import { getPage,authenticate } from '../puppeteer/service';
import { separator } from '../../commons/constants';
import { Post } from './Post';
import { Page } from 'puppeteer';
import { permutations } from './combination';

const random = (min:number, max:number) : number => {
  return min + Math.random() * (max - min);
}

const makeComments = (users:string[], quantity:number) : string[] => {
  let comments: string[] = quantity == 1 ? users : permutations(users,quantity-1);
  return comments.sort(() => Math.random() - 0.5);
}

const sleep = async (ms:number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const publicComment = async ({url,quantity,comment : { customizableComments,users,hashtag},unique}: Post): Promise<void> => {
  
  const commentsPost = customizableComments ?? makeComments(users,quantity);
  
  if (!isInstagram(url)) throw new HTTP400Error("Ingresar una url de instagram");
  const isAuth = await authenticate();
  
  if(!isAuth) throw new HTTP400Error("Usuario y/o contraseña incorrecto");
  let counterComments = 0;

  const page = await getPage(url);
  for (const comment of commentsPost) { 
    await commentPost(page,comment,hashtag,unique);
    counterComments++;
  }
  logger.info(`Total comments: ${counterComments}`);
  
};


const commentPost = async (page: Page,message:string,hashtag: string = '',unique:Boolean = true): Promise<void> => {
  if(unique){
    const messageSplit = message.split(separator);
    let uniqueMessage = [...new Set(messageSplit)]; 
    if(uniqueMessage.length < messageSplit.length) return;
  }

  const timeWaitComment = random(125,1324);
  const timeWait = random(timeWaitComment+5217,32542);
  const textTareaComment = 'textarea';

  await page.waitForSelector(textTareaComment);
  await page.type(textTareaComment, `${hashtag} ${message}`,{ delay: timeWaitComment });
  
  await page.click('button[type="submit"]');
  await page.waitFor(timeWait);
};

const isInstagram = (url:string): boolean => {
    //TODO: Implementar
    return true;
};
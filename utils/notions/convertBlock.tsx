import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { v4 as uuid } from 'uuid';
import ogs from 'open-graph-scraper';
import { URL } from 'url';
import AWS from 'aws-sdk';

export interface IConvertBlock {
  id: string;
  type: string;
  text?: RichTextItemResponse[];
  hasChildren?: boolean;
  url?: string;
  caption?: RichTextItemResponse[];
  code?: string;
  language?: string;
  children?: IConvertBlock[];
  title?: string;
  description?: string;
  image?: any;
  favicon?: any;
}
export type TBlockListType = 'numbered_list_item' | 'bulleted_list_item';

// Content-Type에서 이미지의 확장자 추출하는 함수
function getImageExtension(contentType: string) {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
}
export default async function convertBlock(
  block: BlockObjectResponse,
): Promise<IConvertBlock> {
  try {
    if (
      block.type === 'paragraph' ||
      block.type === 'heading_1' ||
      block.type === 'heading_2' ||
      block.type === 'heading_3' ||
      block.type === 'bulleted_list_item' ||
      block.type === 'numbered_list_item' ||
      block.type === 'quote'
    ) {
      return {
        id: block.id,
        type: block.type,
        // @ts-ignore
        text: block[block.type].rich_text,
        hasChildren: block.has_children,
      };
    }

    if (block.type === 'image') {
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID as string,
        },
      });
      let imageUrl;
      if (block.image.type === 'file') {
        const response = await fetch(block.image.file.url);
        const imageBuffer = await response.arrayBuffer();

        // 원본 이미지의 Content-Type 추출
        const contentType = response.headers.get('content-type');

        const imageKey = `images/${block.id}.${getImageExtension(
          contentType as string,
        )}`;
        const checkParams = {
          Bucket: 'woo1031bucket',
          Key: imageKey,
        };
        let isExist;
        try {
          await s3.headObject(checkParams).promise();
          imageUrl = `https://${s3.config.endpoint}/${checkParams.Bucket}/${checkParams.Key}`;
          isExist = true;
        } catch (error: any) {
          if (error.name === 'NotFound') {
            isExist = false;
          } else {
            console.log('error:::', error);
            throw error;
          }
        }
        if (!isExist) {
          const params = {
            Bucket: 'woo1031bucket',
            Key: imageKey,
            Body: Buffer.from(imageBuffer),
          };

          const uploadResult = await s3.upload(params).promise();
          imageUrl = uploadResult.Location;
        }
      }
      return {
        id: block.id,
        type: 'image',
        caption: block.image.caption,
        ...(block.image.type === 'file' ? { url: imageUrl } : {}),
      };
    }

    if (block.type === 'code') {
      return {
        id: block.id,
        type: 'code',
        code: block.code.rich_text.reduce(
          (acc, cur) => acc + cur.plain_text,
          '',
        ),
        language: block.code.language,
      };
    }

    if (block.type === 'bookmark') {
      const { result, error } = await ogs({ url: block.bookmark.url });
      if (error) {
        return {
          id: block.id,
          type: 'bookmark',
        };
      }
      return {
        id: block.id,
        type: 'bookmark',
        title: result?.ogTitle ?? result?.twitterTitle ?? '',
        description: result.ogDescription || result.twitterDescription || '',
        image: result.ogImage?.[0]?.url,
        favicon: result.favicon?.startsWith('http')
          ? result.favicon
          : result.favicon?.startsWith('//')
          ? `http:${result.favicon}`
          : new URL(result.requestUrl ?? '').origin + result.favicon,
        url: result.requestUrl,
      };
    }

    if (block.type === 'link_preview') {
      const { result } = await ogs({ url: block.link_preview.url });
      return {
        id: block.id,
        type: 'link_preview',
        title: result?.ogTitle ?? result?.twitterTitle ?? '',
        description: result.ogDescription || result.twitterDescription || '',
        image: result.ogImage?.[0]?.url,
        favicon: result.favicon?.startsWith('http')
          ? result.favicon
          : new URL(result.requestUrl ?? '').origin + result.favicon,
        url: result.requestUrl,
      };
    }

    return {
      id: block.id,
      type: block.type,
    };
  } catch (error) {
    console.log(error);
    return {
      id: block.id,
      type: block.type,
    };
  }
}

export function convertList2Block(blocks: IConvertBlock[]) {
  let listTypeArray: IConvertBlock[] = [];
  let listType: TBlockListType | null = null;
  const result = blocks.reduce((pre: IConvertBlock[], cur: IConvertBlock) => {
    if (['numbered_list_item', 'bulleted_list_item'].includes(cur.type)) {
      if (!!listType && listType !== cur.type) {
        const prevTypeList = [...listTypeArray];
        const prevType = listType;
        listType = cur.type as TBlockListType;
        listTypeArray = [cur];
        return [
          ...pre,
          {
            id: uuid(),
            type: prevType as TBlockListType,
            hasChildren: false,
            children: prevTypeList,
          },
        ];
      }
      listType = cur.type as TBlockListType;
      listTypeArray.push({
        ...cur,
        ...(cur.hasChildren && cur.children
          ? {
              children: convertList2Block(cur.children),
            }
          : {}),
      });
      return [...pre];
    } else {
      const prevTypeList = [...listTypeArray];
      const prevType = listType;
      listTypeArray = [];
      return [
        ...pre,
        ...(prevTypeList.length
          ? [
              {
                id: uuid(),
                type: prevType as TBlockListType,
                hasChildren: false,
                children: prevTypeList,
              },
              cur,
            ]
          : [cur]),
      ];
    }
  }, []);

  if (listTypeArray.length) {
    if (
      !!listType &&
      ['numbered_list_item', 'bulleted_list_item'].includes(listType)
    ) {
      return [
        ...result,
        {
          id: uuid(),
          type: listType,
          hasChildren: false,
          children: listTypeArray,
        },
      ];
    }
    return [...result, ...listTypeArray];
  }
  return result;
}

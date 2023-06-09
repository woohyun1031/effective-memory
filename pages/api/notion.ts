import { notionApi } from '#apis/index';
import convertBlock, {
  convertList2Block,
  IConvertBlock,
} from '#utils/notions/convertBlock';
import { Client } from '@notionhq/client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export interface IPageFile {
  expiry_time: string;
  url: string;
}
export interface IPage {
  archived: boolean;
  cover: { type: string; external?: any; file?: IPageFile } | null;
  created_by: { object: string; id: string };
  created_time: string;
  icon: { type: string; emoji: string } | null;
  id: string;
  last_edited_by: {
    object: string;
    id: string;
  };
  last_edited_time: string;
  object: string;
  parent: {
    type: string;
    database_id: string;
  };
  properties: Record<string, Record<string, any>>;
  url: string;
}
export interface INotionPageList {
  has_more: boolean;
  next_cursor: any;
  object: string;
  page: {};
  results: IPage[];
  type: 'page';
}

export const notionClient = new Client({ auth: `${process.env.NOTION_TOKEN}` });

export const getNotionPages = async (pages: number) => {
  if (!pages) return;
  try {
    return await notionApi
      .post<INotionPageList>(
        `/databases/${process.env.NOTION_DATABASE}/query`,
        {
          page_size: pages ?? 0,
        },
      )
      .then((response) => response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getNotionPageList = async ({
  pages,
  start_cursor,
  type,
}: {
  pages: number;
  start_cursor?: string;
  type?: string;
}) => {
  if (!pages) return;
  const options = type
    ? {
        and: [
          {
            property: 'isBlog',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Type',
            multi_select: {
              contains: type,
            },
          },
        ],
      }
    : {
        property: 'isBlog',
        checkbox: {
          equals: true,
        },
      };
  try {
    return await notionApi
      .post<INotionPageList>(
        `/databases/${process.env.NOTION_DATABASE}/query`,
        {
          page_size: pages ?? 0,
          start_cursor: start_cursor ?? undefined,
          filter: options,
        },
      )
      .then((response) => response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getNotionPage = async (id: string) => {
  if (!id) return;
  try {
    return await notionApi
      .get<IPage>(`/pages/${id}`)
      .then((response) => response.data);
  } catch (error) {
    console.error(error);
  }
};

export const getNotionBlockChildren = async (id: string) => {
  if (!id) return;
  try {
    const blockChildren = await notionApi.get<{
      object: string;
      results: BlockObjectResponse[];
    }>(`/blocks/${id}/children`);
    return blockChildren.data.results;
  } catch (error) {
    console.error(error);
  }
};

export const getNotionPageDetail = async (id: string) => {
  if (!id) return;
  async function rc(id: string): Promise<IConvertBlock[]> {
    const blockChildren = await getNotionBlockChildren(id);
    if (!blockChildren) return [];
    const blockChildrenList = await Promise.all(
      blockChildren?.map(async (item) => {
        const block = await convertBlock(item);
        if (block?.hasChildren) {
          const result = await rc(block.id);
          block['children'] = result;
        }
        return block;
      }),
    );
    return blockChildrenList;
  }
  try {
    const response = await rc(id);
    const result = convertList2Block(response);
    return result;
  } catch (error) {
    console.error(error);
  }
};

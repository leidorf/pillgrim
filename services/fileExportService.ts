import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

const cachePath = (fileName: string) => `${FileSystem.cacheDirectory}${fileName}`;

export const writeTextFile = async (params: {
  fileName: string;
  content: string;
}): Promise<void> => {
  await FileSystem.writeAsStringAsync(cachePath(params.fileName), params.content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
};

export const renderHtmlToPdf = async (params: {
  fileName: string;
  html: string;
}): Promise<void> => {
  const { uri } = await Print.printToFileAsync({ html: params.html });
  await FileSystem.moveAsync({ from: uri, to: cachePath(params.fileName) });
};

export const shareFile = async (params: {
  fileName: string;
  mimeType: string;
}): Promise<void> => {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(cachePath(params.fileName), {
    mimeType: params.mimeType,
    dialogTitle: params.fileName,
  });
};

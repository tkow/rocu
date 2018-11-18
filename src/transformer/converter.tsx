import * as objectRestSpread from "@babel/plugin-proposal-object-rest-spread";
import * as transformJSX from "@babel/plugin-transform-react-jsx";
import * as babelStandAlone from "@babel/standalone";
import * as mdx from "@mdx-js/mdx";
import { MDXTag, MDXTagProps } from "@mdx-js/tag";
import * as React from "react";

const convertWithBabel = (raw: string): string | null =>
  babelStandAlone.transform(raw, {
    plugins: [transformJSX, objectRestSpread],
  }).code;

export const applyMarkdownTextToMdxTag = (markdownText: string): string => {
  return mdx.sync(markdownText, {
    skipExport: true,
  });
};

export interface TransformConfig<T extends keyof JSX.IntrinsicElements> {
  customComponents: MDXTagProps<T>["components"];
  props: MDXTagProps<T>["props"];
}
export const transformRawStringToHtml = <T extends keyof JSX.IntrinsicElements>(config: TransformConfig<T>) => (
  content: string,
): React.ReactElement<any> => {
  const raw = applyMarkdownTextToMdxTag(content);
  const code = convertWithBabel(raw);
  const scope = {};
  const fullScope = {
    MDXTag,
    components: config.customComponents,
    props: config.props,
    ...scope,
  };
  const keys = Object.keys(fullScope);
  const values = keys.map(key => fullScope[key]);
  const fn = new Function("React", ...keys, `return ${code}`);
  const resultComponent = fn(React, ...values);
  return resultComponent;
};
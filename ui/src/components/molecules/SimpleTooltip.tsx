/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type SimpleTooltipProps = {
  side?: 'top' | 'right' | 'bottom' | 'left',
  text: string,
  children: any
};

export default function SimpleTooltip({ side, text, children }: SimpleTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
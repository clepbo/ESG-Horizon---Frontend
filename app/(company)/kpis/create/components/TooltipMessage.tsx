interface Props {
  title: string;
  message: string;
}

export function TooltipMessage({ title, message }: Props) {
  return (
    <div className="flex flex-col ">
      <h6 className="text-sm underline"> {title} </h6>
      <small>{message} </small>
    </div>
  );
}

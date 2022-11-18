import KofiButton  from "kofi-button";

export default function Kofi(props) {

  return <div class={{flexGrow: 1}}><KofiButton kofiID={props.id} title={props.text} /></div>

}
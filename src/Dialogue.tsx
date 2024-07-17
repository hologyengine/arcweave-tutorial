import { useService } from '@hology/react';
import './App.css';
import { DialogueService } from './services/dialogue-service';

function Dialogue() {
  const dialogueService = useService(DialogueService)
  const dialogue = dialogueService.activeDialogue.value

  const optionButtons = () => {
    if (dialogue.end) {
      return <button onClick={() => dialogueService.endDialogue()}>Leave</button>
    }

    if (dialogue.options.length > 1) {
      return dialogue.options.map(option => (
        <button
          onClick={() => dialogueService.selectOption(option)} 
          key={option.label}
          dangerouslySetInnerHTML={{__html: option.label}}
        > 
        </button>
      ))
    }

    return (
      <button onClick={() => dialogueService.selectOption(dialogue.options[0])}>
        Continue
      </button>
    )
  }

  return dialogue != null && 
    <div className="dialogue-overlay">
      <div className="dialogue-wrapper">
        <div className="dialogue-name">{dialogue.speakerName}</div>
        <div className="dialogue-content" dangerouslySetInnerHTML={{__html: dialogue.content}}></div>
        <div className="dialogue-options">{optionButtons()}</div>
      </div>
    </div>
}

export default Dialogue;
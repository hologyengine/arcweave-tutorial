import { useService } from '@hology/react';
import './App.css';
import { DialogueService } from './services/dialogue-service';

function Dialogue() {
  const dialogueService = useService(DialogueService)
  const dialogue = dialogueService.activeDialogue.value

  const renderButtons = () => {
    if (dialogue.end) {
      return <button onClick={() => dialogueService.endDialogue()}>Leave</button>;
    }

    if (dialogue.options.length > 1) {
      return dialogue.options.map(option => (
        <button 
          onClick={() => dialogueService.selectPath(option)} 
          key={option.label}
        >
          {option.label}
        </button>
      ));
    }

    return (
      <button onClick={() => dialogueService.selectPath(dialogue.options[0])}>
        Continue
      </button>
    );
  };

  return dialogue != null && <div style={{position: 'absolute', width: '100%', height: '100%'}}>
      <div>{dialogue.speakerName}</div>
      <div>
        {dialogue.content}
      </div>
      <div className="choices">{renderButtons()}</div>
    </div>
}

export default Dialogue;
import torch
import torch.nn as nn

class StatePredictor(nn.Module):
    def __init__(self, input_size=3, hidden_size=64, num_layers=2, output_size=3, seq_len=10):
        super(StatePredictor, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.seq_len = seq_len
        
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size * seq_len)

    def forward(self, x):
        # x shape: (batch, input_seq_len, input_size)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        # Take the last hidden state
        out = self.fc(out[:, -1, :])
        # Reshape to (batch, seq_len, output_size)
        out = out.view(-1, self.seq_len, 3)
        return out

def get_model():
    model = StatePredictor()
    # In a real scenario, we would load weights here
    # model.load_state_dict(torch.load("model.pth"))
    model.eval()
    return model

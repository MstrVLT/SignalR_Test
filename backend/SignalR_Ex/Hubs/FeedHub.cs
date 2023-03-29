using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.SignalR;

namespace SignalR_Ex.Hubs;

public class FeedHub : Hub
{
    public record MessageValue (
        string firstMessage,
        string secondMessage
    );

    public override async Task OnConnectedAsync()
    {
        await Clients.All.SendAsync("newMessage", 
            $"{Context.ConnectionId} joined.", "second param");
        await base.OnConnectedAsync();
    }
    
    public async Task<string> SendMessageVariadic(string message, string message2)
    {
        var newMsg = message + message2;
        await Clients.All.SendAsync("newMessageVariadic", "anonymous", newMsg);
        return newMsg;
    }

    public async Task<string> SendMessageObject(MessageValue messageValue)
    {
        var newMsg = messageValue.firstMessage + messageValue.secondMessage;
        await Clients.All.SendAsync("newMessageObject", "anonymous", newMsg);
        return newMsg;
    }
    
    public async IAsyncEnumerable<int> Counter(
        int count,
        int delay,
        [EnumeratorCancellation]
        CancellationToken cancellationToken)
    {
        for (var i = 0; i < count; i++)
        {
            // Check the cancellation token regularly so that the server will stop
            // producing items if the client disconnects.
            cancellationToken.ThrowIfCancellationRequested();

            yield return i;

            // Use the cancellationToken in other APIs that accept cancellation
            // tokens so the cancellation can flow down to them.
            await Task.Delay(delay, cancellationToken);
        }
    }
}
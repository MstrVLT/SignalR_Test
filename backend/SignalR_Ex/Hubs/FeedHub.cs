using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.SignalR;

namespace SignalR_Ex.Hubs;

public class FeedHub : Hub
{            
    public override async Task OnConnectedAsync()
    {
        await Clients.All.SendAsync("newMessage", 
            $"{Context.ConnectionId} joined.");
        await base.OnConnectedAsync();
    }
    
    public async Task SendMessage(string message)
    {
        await Clients.All.SendAsync("newMessage", "anonymous", message);
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
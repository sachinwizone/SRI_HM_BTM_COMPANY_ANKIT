using System;
using System.Windows.Forms;
using TallySync.Forms;
using TallySync.Services;

namespace TallySync
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            // Initialize services
            var tallyConnector = new RealTallyConnector();
            var cloudService = new CloudApiService();
            
            // Start main form
            Application.Run(new MainForm(tallyConnector, cloudService));
        }
    }
}
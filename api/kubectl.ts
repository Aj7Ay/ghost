import type { VercelRequest, VercelResponse } from '@vercel/node';

interface KubectlRequest {
  command: string;
  namespace?: string;
}

// Simulated Kubernetes resources for learning
const simulatedResources = {
  pods: [
    { name: 'web-app', namespace: 'default', status: 'Running', age: '2d', ready: '1/1' },
    { name: 'api-server', namespace: 'default', status: 'Running', age: '1d', ready: '1/1' },
    { name: 'database', namespace: 'default', status: 'Running', age: '3d', ready: '1/1' },
  ],
  services: [
    { name: 'web-service', namespace: 'default', type: 'ClusterIP', clusterIP: '10.96.0.1', ports: '80/TCP', age: '2d' },
    { name: 'api-service', namespace: 'default', type: 'LoadBalancer', externalIP: '<pending>', ports: '8080/TCP', age: '1d' },
  ],
  deployments: [
    { name: 'web-app', namespace: 'default', ready: '3/3', upToDate: '3', available: '3', age: '2d' },
    { name: 'api-server', namespace: 'default', ready: '2/2', upToDate: '2', available: '2', age: '1d' },
  ],
  nodes: [
    { name: 'node-1', status: 'Ready', role: 'control-plane', age: '5d', version: 'v1.28.0' },
    { name: 'node-2', status: 'Ready', role: '<none>', age: '5d', version: 'v1.28.0' },
  ],
};

function parseKubectlCommand(command: string): { action: string; resource: string; name?: string; namespace?: string; flags?: string[] } {
  const parts = command.trim().split(/\s+/).filter(p => p);
  const action = parts[1] || '';
  const resource = parts[2] || '';
  const name = parts[3] || undefined;
  
  // Extract namespace from flags
  const namespaceMatch = command.match(/--namespace=(\S+)|-n\s+(\S+)/);
  const namespace = namespaceMatch ? (namespaceMatch[1] || namespaceMatch[2]) : 'default';
  
  // Extract other flags
  const flags = parts.filter((p, i) => i > 3 && p.startsWith('-'));
  
  return { action, resource, name, namespace, flags };
}

function executeKubectlCommand(command: string): { success: boolean; output: string; error?: string } {
  const parsed = parseKubectlCommand(command);
  const { action, resource, name, namespace } = parsed;

  try {
    // Handle different kubectl commands
    switch (action) {
      case 'get':
        if (!resource) {
          return {
            success: false,
            output: '',
            error: 'Error: resource type is required (e.g., pods, services, deployments)'
          };
        }

        if (resource === 'pods' || resource === 'pod' || resource === 'po') {
          const pods = simulatedResources.pods.filter(p => !name || p.name === name);
          if (pods.length === 0) {
            return {
              success: true,
              output: `No resources found in ${namespace} namespace.`
            };
          }
          
          let output = `NAME\t\tREADY\tSTATUS\tRESTARTS\tAGE\n`;
          pods.forEach(pod => {
            output += `${pod.name}\t${pod.ready}\t${pod.status}\t0\t\t${pod.age}\n`;
          });
          return { success: true, output };
        }

        if (resource === 'services' || resource === 'service' || resource === 'svc') {
          const services = simulatedResources.services.filter(s => !name || s.name === name);
          if (services.length === 0) {
            return {
              success: true,
              output: `No resources found in ${namespace} namespace.`
            };
          }
          
          let output = `NAME\t\tTYPE\t\tCLUSTER-IP\tEXTERNAL-IP\tPORT(S)\t\tAGE\n`;
          services.forEach(svc => {
            const extIP = svc.externalIP || svc.clusterIP || '<none>';
            output += `${svc.name}\t${svc.type}\t${svc.clusterIP}\t${extIP}\t\t${svc.ports}\t\t${svc.age}\n`;
          });
          return { success: true, output };
        }

        if (resource === 'deployments' || resource === 'deployment' || resource === 'deploy') {
          const deployments = simulatedResources.deployments.filter(d => !name || d.name === name);
          if (deployments.length === 0) {
            return {
              success: true,
              output: `No resources found in ${namespace} namespace.`
            };
          }
          
          let output = `NAME\t\tREADY\tUP-TO-DATE\tAVAILABLE\tAGE\n`;
          deployments.forEach(deploy => {
            output += `${deploy.name}\t${deploy.ready}\t${deploy.upToDate}\t\t${deploy.available}\t\t${deploy.age}\n`;
          });
          return { success: true, output };
        }

        if (resource === 'nodes' || resource === 'node' || resource === 'no') {
          const nodes = simulatedResources.nodes.filter(n => !name || n.name === name);
          let output = `NAME\t\tSTATUS\tROLES\t\tAGE\tVERSION\n`;
          nodes.forEach(node => {
            output += `${node.name}\t${node.status}\t${node.role}\t${node.age}\t${node.version}\n`;
          });
          return { success: true, output };
        }

        if (resource === 'all') {
          return {
            success: true,
            output: `Resources in ${namespace} namespace:\n\n` +
                   `Pods: ${simulatedResources.pods.length}\n` +
                   `Services: ${simulatedResources.services.length}\n` +
                   `Deployments: ${simulatedResources.deployments.length}\n`
          };
        }

        return {
          success: false,
          output: '',
          error: `Error: unknown resource type "${resource}". Use "kubectl api-resources" for a complete list.`
        };

      case 'describe':
        if (!resource || !name) {
          return {
            success: false,
            output: '',
            error: 'Error: resource type and name are required (e.g., kubectl describe pod my-pod)'
          };
        }

        if (resource === 'pod' || resource === 'pods') {
          const pod = simulatedResources.pods.find(p => p.name === name);
          if (!pod) {
            return {
              success: false,
              output: '',
              error: `Error from server (NotFound): pods "${name}" not found`
            };
          }
          
          return {
            success: true,
            output: `Name:         ${pod.name}\n` +
                   `Namespace:    ${namespace}\n` +
                   `Status:       ${pod.status}\n` +
                   `Ready:        ${pod.ready}\n` +
                   `Age:          ${pod.age}\n\n` +
                   `Containers:\n` +
                   `  ${pod.name}:\n` +
                   `    Image:     nginx:latest\n` +
                   `    Ready:     True\n` +
                   `    Restarts:  0\n`
          };
        }

        return {
          success: false,
          output: '',
          error: `Error: describe command not fully implemented for ${resource}`
        };

      case 'apply':
        return {
          success: true,
          output: `✅ Resource created/updated successfully!\n\n` +
                 `This is a simulated environment. In a real cluster, your manifest would be applied.`
        };

      case 'delete':
        if (!resource || !name) {
          return {
            success: false,
            output: '',
            error: 'Error: resource type and name are required (e.g., kubectl delete pod my-pod)'
          };
        }
        return {
          success: true,
          output: `✅ ${resource}/${name} deleted\n\n` +
                 `This is a simulated environment. In a real cluster, the resource would be deleted.`
        };

      case 'cluster-info':
        return {
          success: true,
          output: `Kubernetes control plane is running at https://kubernetes.docker.internal:6443\n` +
                 `CoreDNS is running at https://kubernetes.docker.internal:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy\n\n` +
                 `To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.`
        };

      case 'version':
        return {
          success: true,
          output: `Client Version: version.Info{Major:"1", Minor:"28", GitVersion:"v1.28.0"}\n` +
                 `Server Version: version.Info{Major:"1", Minor:"28", GitVersion:"v1.28.0"}`
        };

      case 'api-resources':
        return {
          success: true,
          output: `NAME\t\tSHORTNAMES\tAPIVERSION\t\tNAMESPACED\tKIND\n` +
                 `pods\t\tpo\t\tv1\t\t\ttrue\t\tPod\n` +
                 `services\tsvc\t\tv1\t\t\ttrue\t\tService\n` +
                 `deployments\tdeploy\t\tapps/v1\t\t\ttrue\t\tDeployment\n` +
                 `nodes\t\tno\t\tv1\t\t\tfalse\t\tNode\n`
        };

      default:
        if (!action) {
          return {
            success: false,
            output: '',
            error: 'Error: kubectl command is required. Try: get, describe, apply, delete, cluster-info, version'
          };
        }
        return {
          success: false,
          output: '',
          error: `Error: unknown command "${action}". Supported commands: get, describe, apply, delete, cluster-info, version, api-resources`
        };
    }
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: `Error executing command: ${error.message}`
    };
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Kubernetes Explorer kubectl API (Simulated)',
      status: 'active',
      description: 'This is a simulated kubectl API for learning purposes. It returns realistic responses without requiring a real Kubernetes cluster.',
      endpoints: {
        kubectl: 'POST /api/kubectl',
        description: 'Execute kubectl commands in a simulated environment'
      },
      usage: {
        method: 'POST',
        body: {
          command: 'string (required) - kubectl command (e.g., "kubectl get pods")',
          namespace: 'string (optional) - namespace to use'
        }
      },
      supportedCommands: [
        'kubectl get pods',
        'kubectl get services',
        'kubectl get deployments',
        'kubectl get nodes',
        'kubectl describe pod <name>',
        'kubectl apply -f <file>',
        'kubectl delete pod <name>',
        'kubectl cluster-info',
        'kubectl version',
        'kubectl api-resources'
      ]
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests.',
      allowedMethods: ['POST', 'GET', 'OPTIONS']
    });
  }

  try {
    const { command, namespace }: KubectlRequest = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Validate that it's a kubectl command
    if (!command.trim().startsWith('kubectl')) {
      return res.status(400).json({
        error: 'Invalid command',
        message: 'Only kubectl commands are supported. Command must start with "kubectl".'
      });
    }

    // Execute the command
    const result = executeKubectlCommand(command);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Command execution failed',
        output: result.output
      });
    }

    return res.status(200).json({
      success: true,
      output: result.output,
      command: command.trim()
    });

  } catch (error: any) {
    console.error('Kubectl API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}


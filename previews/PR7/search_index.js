var documenterSearchIndex = {"docs":
[{"location":"nlsolvers/#Nonlinear-solvers","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"","category":"section"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"A nonlinear solver should support the solve_nonlinear! function specified below. ","category":"page"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"FerriteSolvers.solve_nonlinear!","category":"page"},{"location":"nlsolvers/#FerriteSolvers.solve_nonlinear!","page":"Nonlinear solvers","title":"FerriteSolvers.solve_nonlinear!","text":"solve_nonlinear!(solver::FerriteSolver{<:NLS}, problem)\n\nSolve one step in the nonlinear problem, given as r(x) = 0, by using the solver of type NLS. \n\n\n\n\n\n","category":"function"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"It can do so, by supporting the following functions","category":"page"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"FerriteSolvers.update_unknowns!\nFerriteSolvers.getmaxiter\nFerriteSolvers.gettolerance","category":"page"},{"location":"nlsolvers/#FerriteSolvers.getmaxiter","page":"Nonlinear solvers","title":"FerriteSolvers.getmaxiter","text":"getmaxiter(nlsolver)\n\nReturns the maximum number of iterations allowed for the nonlinear solver\n\n\n\n\n\n","category":"function"},{"location":"nlsolvers/#FerriteSolvers.gettolerance","page":"Nonlinear solvers","title":"FerriteSolvers.gettolerance","text":"gettolerance(nlsolver)\n\nReturns the iteration tolerance for the solver\n\n\n\n\n\n","category":"function"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"and optionally","category":"page"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"FerriteSolvers.update_state!\nFerriteSolvers.reset_state!","category":"page"},{"location":"nlsolvers/#FerriteSolvers.update_state!","page":"Nonlinear solvers","title":"FerriteSolvers.update_state!","text":"update_state!(nlsolver, r)\n\nA nonlinear solver may solve information about its convergence state. r is the output from calculate_convergence_measure when  this function is called by the default implementation of  check_convergence_criteria.  update_state! is optional to implement\n\n\n\n\n\n","category":"function"},{"location":"nlsolvers/#FerriteSolvers.reset_state!","page":"Nonlinear solvers","title":"FerriteSolvers.reset_state!","text":"reset_state!(nlsolver)\n\nIf update_state! is implemented, this function is used to  reset its state at the beginning of each new time step. \n\n\n\n\n\n","category":"function"},{"location":"nlsolvers/#Implemented-Solvers","page":"Nonlinear solvers","title":"Implemented Solvers","text":"","category":"section"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"NewtonSolver\nSteepestDescent","category":"page"},{"location":"nlsolvers/#FerriteSolvers.NewtonSolver","page":"Nonlinear solvers","title":"FerriteSolvers.NewtonSolver","text":"NewtonSolver(;linsolver=BackslashSolver(), linesearch=NoLineSearch(), maxiter=10, tolerance=1.e-6)\n\nUse the standard NewtonRaphson solver to solve the nonlinear  problem r(x) = 0 with tolerance within the maximum number  of iterations maxiter. The linsolver argument determines the used linear solver whereas the linesearch can be set currently between NoLineSearch or ArmijoGoldstein. The latter globalizes the Newton strategy.\n\n\n\n\n\n","category":"type"},{"location":"nlsolvers/#FerriteSolvers.SteepestDescent","page":"Nonlinear solvers","title":"FerriteSolvers.SteepestDescent","text":"SteepestDescent(;maxiter=10, tolerance=1.e-6)\n\nUse a steepest descent solver to solve the nonlinear  problem r(x) = 0, which minimizes a potential \\Pi with tolerance and the maximum number of iterations maxiter.\n\nThis method is second derivative free and is not as locally limited as a Newton-Raphson scheme. Thus, it is especially suited for stronlgy nonlinear behavior with potentially vanishing tangent stiffnesses.\n\n\n\n\n\n","category":"type"},{"location":"nlsolvers/#Linesearch","page":"Nonlinear solvers","title":"Linesearch","text":"","category":"section"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"Some nonlinear solvers can use linesearch as a compliment,  and the following linesearches are included. ","category":"page"},{"location":"nlsolvers/","page":"Nonlinear solvers","title":"Nonlinear solvers","text":"NoLineSearch\nArmijoGoldstein","category":"page"},{"location":"nlsolvers/#FerriteSolvers.NoLineSearch","page":"Nonlinear solvers","title":"FerriteSolvers.NoLineSearch","text":"Singleton that does not perform a linesearch when used in a nonlinear solver\n\n\n\n\n\n","category":"type"},{"location":"nlsolvers/#FerriteSolvers.ArmijoGoldstein","page":"Nonlinear solvers","title":"FerriteSolvers.ArmijoGoldstein","text":"Armijo-Goldstein{T}(;β=0.9,μ=0.01,τ0=1.0,τmin=1e-4)\n\nBacktracking line search based on the Armijo-Goldstein condition\n\nPi(boldsymbolu + tau Deltaboldsymbolu) leq Pi(boldsymbolu) - mutaudeltaPi(boldsymbolu)Delta boldsymbolu\n\nwhere $\\Pi$ is the potential, $\\tau$ the stepsize, and $\\delta\\Pi$ the residuum.\n\n#Fields\n\nβ::T = 0.9 constant factor that changes the steplength τ in each iteration\nμ::T = 0.01 second constant factor that determines how much the potential needs to decrease additionally\nτ0::T = 1.0 start stepsize \nτmin::T = 1e-4 minimal stepsize\n\n\n\n\n\n","category":"type"},{"location":"linearsolvers/#Linear-solvers","page":"Linear solvers","title":"Linear solvers","text":"","category":"section"},{"location":"linearsolvers/","page":"Linear solvers","title":"Linear solvers","text":"A linear solver should support the update_guess! function specified below. ","category":"page"},{"location":"linearsolvers/","page":"Linear solvers","title":"Linear solvers","text":"FerriteSolvers.update_guess!","category":"page"},{"location":"linearsolvers/#Implemented-Solvers","page":"Linear solvers","title":"Implemented Solvers","text":"","category":"section"},{"location":"linearsolvers/#BackslashSolver","page":"Linear solvers","title":"BackslashSolver","text":"","category":"section"},{"location":"linearsolvers/","page":"Linear solvers","title":"Linear solvers","text":"BackslashSolver","category":"page"},{"location":"linearsolvers/#FerriteSolvers.BackslashSolver","page":"Linear solvers","title":"FerriteSolvers.BackslashSolver","text":"BackslashSolver()\n\nThe standard julia linear solver using Δx = -drdx\n\n\n\n\n\n","category":"type"},{"location":"userfunctions/#User-problem","page":"User problem","title":"User problem","text":"","category":"section"},{"location":"userfunctions/","page":"User problem","title":"User problem","text":"The key to using the FerriteSolvers.jl package is to define your  problem. This problem should support a set of functions in order for the solver to solve your problem.  While some functions are always required, some are only required by certain solvers.  Furthermore, a two-level API exist: Simple and advanced.  The simple API does not expose which solver is used, while the advanced API requires you to define different methods depending on the type of solver. ","category":"page"},{"location":"userfunctions/#Applicable-to-all-solvers","page":"User problem","title":"Applicable to all solvers","text":"","category":"section"},{"location":"userfunctions/","page":"User problem","title":"User problem","text":"FerriteSolvers.getunknowns\nFerriteSolvers.getresidual\nFerriteSolvers.update_to_next_step!\nFerriteSolvers.update_problem!\nFerriteSolvers.handle_converged!\nFerriteSolvers.postprocess!","category":"page"},{"location":"userfunctions/#FerriteSolvers.getunknowns","page":"User problem","title":"FerriteSolvers.getunknowns","text":"getunknowns(problem)\n\nReturn the current vector of unknown values\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.getresidual","page":"User problem","title":"FerriteSolvers.getresidual","text":"getresidual(problem)\n\nReturn the current residual vector of the problem\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.update_to_next_step!","page":"User problem","title":"FerriteSolvers.update_to_next_step!","text":"update_to_next_step!(problem, time)\n\nUpdate prescribed values, external loads etc. for the given time.\n\nThis function is called in the beginning of each new time step.  Note that for adaptive time stepping, it may be called with a lower  time than the previous time if the solution did not converge.\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.update_problem!","page":"User problem","title":"FerriteSolvers.update_problem!","text":"update_problem!(problem)\nupdate_problem!(problem, Δx)\n\nAssemble the residual and stiffness for x+=Δx. \n\nSome linear solvers may be inaccurate, and if modified stiffness is used  to enforce constraints on x, it is good the force Δx=0 on these components inside this function. \nΔx is not given in the first call after update_to_next_step! in which case no change of x should be made. \n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.handle_converged!","page":"User problem","title":"FerriteSolvers.handle_converged!","text":"handle_converged!(problem)\n\nDo necessary update operations once it is known that the  problem has converged. E.g., update old values to the current.  Only called directly after the problem has converged. \n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.postprocess!","page":"User problem","title":"FerriteSolvers.postprocess!","text":"postprocess!(problem, step)\n\nPerform any postprocessing at the current time and step nr step Called after time step converged, and after handle_converged!\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#Simple-API","page":"User problem","title":"Simple API","text":"","category":"section"},{"location":"userfunctions/","page":"User problem","title":"User problem","text":"FerriteSolvers.calculate_convergence_measure\nFerriteSolvers.getjacobian\nFerriteSolvers.getdescentpreconditioner","category":"page"},{"location":"userfunctions/#FerriteSolvers.calculate_convergence_measure","page":"User problem","title":"FerriteSolvers.calculate_convergence_measure","text":"calculate_convergence_measure(problem) -> AbstractFloat\n\nCalculate a value to be compared with the tolerance of the nonlinear solver.  A standard case when using Ferrite.jl is norm(getresidual(problem)[Ferrite.free_dofs(dbcs)])  where dbcs::Ferrite.ConstraintHandler.\n\nThe advanced API alternative is check_convergence_criteria\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.getjacobian","page":"User problem","title":"FerriteSolvers.getjacobian","text":"getjacobian(problem)\n\nReturn the jacobian drdx, or approximations thereof.\n\nMust be defined for NewtonSolver, but can also be  defined by the advanced API alternative getsystemmatrix:  getsystemmatrix(problem, ::NewtonSolver)\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.getdescentpreconditioner","page":"User problem","title":"FerriteSolvers.getdescentpreconditioner","text":"getdescentpreconditioner(problem)\n\nReturn a preconditioner K for calculating the descent direction p, considering solving r(x)=0 as a minimization problem of f(x) where r=∇f. The descent direction is then p = K⁻¹ ∇f\n\nUsed by the SteepestDescent solver, and defaults to I if not defined.  The advanced API alternative is getsystemmatrix:  getsystemmatrix(problem, ::SteepestDescent)\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#Advanced-API","page":"User problem","title":"Advanced API","text":"","category":"section"},{"location":"userfunctions/","page":"User problem","title":"User problem","text":"FerriteSolvers.getsystemmatrix\nFerriteSolvers.check_convergence_criteria","category":"page"},{"location":"userfunctions/#FerriteSolvers.getsystemmatrix","page":"User problem","title":"FerriteSolvers.getsystemmatrix","text":"getsystemmatrix(problem,nlsolver)\n\nReturn the system matrix of the problem. For a Newton solver this method should return the Jacobian, while for a steepest descent method this can be a preconditioner as e.g., the L2 product of the gradients. By default the system matrix for the SteepestDescent method is the unity matrix and thus, renders a vanilla gradient descent solver.\n\n\n\n\n\n","category":"function"},{"location":"userfunctions/#FerriteSolvers.check_convergence_criteria","page":"User problem","title":"FerriteSolvers.check_convergence_criteria","text":"check_convergence_criteria(problem, nlsolver) -> Bool\n\nCheck if problem has converged and update the state  of nlsolver wrt. number of iterations and a convergence measure if applicable.\n\n\n\n\n\n","category":"function"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = FerriteSolvers","category":"page"},{"location":"#FerriteSolvers","page":"Home","title":"FerriteSolvers","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Documentation for FerriteSolvers.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"solve_ferrite_problem!\nFerriteSolver","category":"page"},{"location":"#FerriteSolvers.solve_ferrite_problem!","page":"Home","title":"FerriteSolvers.solve_ferrite_problem!","text":"solve_ferrite_problem!(solver, problem)\n\nSolve a time-dependent problem r(x(t),t)=0 for x(t),  stepping throught the time t, using the solver.\n\nFor details on the functions that should be defined for problem, see User problem\n\n\n\n\n\n","category":"function"},{"location":"#FerriteSolvers.FerriteSolver","page":"Home","title":"FerriteSolvers.FerriteSolver","text":"FerriteSolver(nlsolver, timestepper, linsolver=BackslashSolver())\n\nThe standard solver, with two parts: A nonlinear solver  (see Nonlinear solvers) and a time stepper (see Time steppers). \n\n\n\n\n\n","category":"type"},{"location":"timesteppers/#Time-steppers","page":"Time steppers","title":"Time steppers","text":"","category":"section"},{"location":"timesteppers/","page":"Time steppers","title":"Time steppers","text":"A time stepper should support the following functions","category":"page"},{"location":"timesteppers/","page":"Time steppers","title":"Time steppers","text":"FerriteSolvers.initial_time\nFerriteSolvers.islaststep\nFerriteSolvers.update_time","category":"page"},{"location":"timesteppers/#FerriteSolvers.initial_time","page":"Time steppers","title":"FerriteSolvers.initial_time","text":"initial_time(timestepper)\n\nReturn the starting time for the given timestepper\n\n\n\n\n\n","category":"function"},{"location":"timesteppers/#FerriteSolvers.islaststep","page":"Time steppers","title":"FerriteSolvers.islaststep","text":"islaststep(timestepper, time, step)->Bool\n\nReturn true if the current step/time is the last step, return false otherwise \n\n\n\n\n\n","category":"function"},{"location":"timesteppers/#FerriteSolvers.update_time","page":"Time steppers","title":"FerriteSolvers.update_time","text":"update_time(solver::FerriteSolver{<:Any, <:TST}, time, step, converged::Bool)\n\nReturn the next time and step number, depending on if the previous time step converged  or not. If not converged, return the same step but a new_time<time to reduce the  time step. If it is not possible to retry with shorter timestep, throw  ConvergenceError. If converged, update time step as planned.  Note: The full solver is given as input to allow specialization on e.g. if a  Newton iteration has required many iterations, shorten the next time step as a  precausionary step\n\n\n\n\n\n","category":"function"},{"location":"timesteppers/#Implemented-steppers","page":"Time steppers","title":"Implemented steppers","text":"","category":"section"},{"location":"timesteppers/#FixedTimeStepper","page":"Time steppers","title":"FixedTimeStepper","text":"","category":"section"},{"location":"timesteppers/","page":"Time steppers","title":"Time steppers","text":"FixedTimeStepper","category":"page"},{"location":"timesteppers/#FerriteSolvers.FixedTimeStepper","page":"Time steppers","title":"FerriteSolvers.FixedTimeStepper","text":"FixedTimeStepper(num_steps::int, Δt, t_start=0)\nFixedTimeStepper(t::Vector)\n\nA time stepper which gives fixed time steps. If the convenience interface is used, constant increments are used. Note that  length(t)=num_steps+1 since the first value is just the initial  value and is not an actual step.  \n\n\n\n\n\n","category":"type"}]
}
